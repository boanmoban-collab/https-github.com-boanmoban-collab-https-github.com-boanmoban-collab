import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';

class MexcLiveTradingService {
  static const String baseUrl = 'https://api.mexc.com';
  final String apiKey;
  final String apiSecret;
  final Dio _dio = Dio();

  MexcLiveTradingService({
    required this.apiKey,
    required this.apiSecret,
  });

  /// 1. دالة جلب التوقيت الرسمي لمنصة MEXC وحساب فارق الوقت لتفادي أخطاء التزامن
  Future<int> _getServerTimeOffset() async {
    try {
      final int localStart = DateTime.now().millisecondsSinceEpoch;
      final response = await _dio.get('$baseUrl/api/v3/time');
      final int localEnd = DateTime.now().millisecondsSinceEpoch;
      
      if (response.statusCode == 200) {
        final int serverTime = response.data['serverTime'];
        final int rtt = ((localEnd - localStart) / 2).round();
        // الفارق الزمني المطلوب إضافته للوقت المحلي للحصول على وقت السيرفر بدقة
        return serverTime - (localStart + rtt);
      }
    } catch (e) {
      print('خطأ في جلب وقت السيرفر: $e');
    }
    return 0;
  }

  /// 2. دالة تشفير وتوليد التوقيع الرقمي HMAC-SHA256
  String _generateSignature(String queryString) {
    final keyBytes = utf8.encode(apiSecret);
    final queryBytes = utf8.encode(queryString);
    final hmac = Hmac(sha256, keyBytes);
    final digest = hmac.convert(queryBytes);
    return digest.toString();
  }

  /// 3. دالة جلب أرصدة المحفظة الحقيقية المتاحة للتداول
  Future<List<Map<String, dynamic>>> getSpotBalances() async {
    try {
      final int timeOffset = await _getServerTimeOffset();
      final int timestamp = DateTime.now().millisecondsSinceEpoch + timeOffset;

      // تجميع معاملات الاستعلام وتوقيعها
      final String queryString = 'timestamp=$timestamp&recvWindow=60000';
      final String signature = _generateSignature(queryString);

      final response = await _dio.get(
        '$baseUrl/api/v3/account?$queryString&signature=$signature',
        options: Options(
          headers: {
            'X-MEXC-APIKEY': apiKey,
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> balancesRaw = response.data['balances'] ?? [];
        return balancesRaw.map((b) => {
          'asset': b['asset'].toString(),
          'free': double.tryParse(b['free'].toString()) ?? 0.0,
          'locked': double.tryParse(b['locked'].toString()) ?? 0.0,
        }).toList();
      }
    } on DioException catch (e) {
      _handleMexcError(e);
    }
    return [];
  }

  /// 4. دالة تنفيذ أمر تداول حقيقي (سوقي أو حدي)
  Future<Map<String, dynamic>?> placeLiveOrder({
    required String symbol,
    required String side, // 'BUY' or 'SELL'
    required String type, // 'LIMIT' or 'MARKET'
    required double quantity,
    double? price, // مطلوب فقط في الـ LIMIT
  }) async {
    try {
      final int timeOffset = await _getServerTimeOffset();
      final int timestamp = DateTime.now().millisecondsSinceEpoch + timeOffset;

      final Map<String, String> params = {
        'symbol': symbol.toUpperCase(),
        'side': side.toUpperCase(),
        'type': type.toUpperCase(),
        'quantity': quantity.toString(),
        'timestamp': timestamp.toString(),
        'recvWindow': '60000',
      };

      if (type.toUpperCase() == 'LIMIT') {
        if (price == null) throw Exception('الأسعار مطلوبة لأوامر LIMIT');
        params['price'] = price.toString();
        params['timeInForce'] = 'GTC';
      }

      // بناء استعلام مرتب لحساب التوقيع بشكل صحيح
      final String queryString = Uri(queryParameters: params).query;
      final String signature = _generateSignature(queryString);

      final response = await _dio.post(
        '$baseUrl/api/v3/order?$queryString&signature=$signature',
        options: Options(
          headers: {
            'X-MEXC-APIKEY': apiKey,
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
    } on DioException catch (e) {
      _handleMexcError(e);
    }
    return null;
  }

  /// 5. معالجة ذكية للأخطاء الحقيقية القادمة من MEXC
  void _handleMexcError(DioException error) {
    if (error.response != null) {
      final int statusCode = error.response!.statusCode ?? 500;
      final responseData = error.response!.data;
      final String msg = responseData is Map ? (responseData['msg'] ?? 'خطأ غير معروف') : error.message;
      
      print('--- خطأ من منصة MEXC [HTTP $statusCode] ---');
      print('رسالة الخطأ: $msg');
      
      // هنا يمكنك إرسال إشعارات أو تحديث واجهة المستخدم للتطبيق Maria
    } else {
      print('خطأ في الاتصال بالشبكة: ${error.message}');
    }
  }
}
