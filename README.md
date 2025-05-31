# Matematik Oyunu - Web Uygulaması

Bu web uygulaması, 6-8 yaşındaki çocuklar için eğlenceli ve öğretici bir matematik oyunu sunar.
Ornek oyun Netlify'a deploy edildi : https://app.netlify.com/sites/splendid-cupcake-7c75ef/deploys/6818bcd7c9fe8aa5e9dd8908
Oyunu denemek icin bu link kullanilabilir : https://splendid-cupcake-7c75ef.netlify.app/azra_math_game.html

## Özellikler

* Oyuncuya ana sayfada selamlama mesajı
* Mevcut seviye ve puan gösterimi
* Seviye bazlı artan zorlukta sorular:

  * **Grup-1**: Tek basamaklı toplama soruları
  * **Grup-2**: Tek basamaklı toplama + 0-2 arası çarpma
  * **Grup-3**: Tek basamaklı toplama + 0-4 arası çarpma
  * **Grup-4**: 15'e kadar toplama + 0-5 arası çarpma
  * **Grup-5**: 15'e kadar toplama + 0-10 arası çıkartma + 0-5 arası çarpma
  * **Grup-6**: 15'e kadar toplama + 0-10 arası çıkartma + 0-7 arası çarpma
  * **Grup-7**: 15'e kadar toplama + 0-10 arası çıkartma + 0-10 arası çarpma
  * **Grup-8**: 15'e kadar toplama + 15'e kadar çıkartma + 0-10 arası çarpma
  * **Grup-9**: 15'e kadar toplama + 15'e kadar çıkartma + 0-10 arası çarpma (Her soru için 10 sn süre)
  * **Grup-10**: 15'e kadar toplama + 15'e kadar çıkartma + 0-10 arası çarpma (Her soru için 5 sn süre)

* Cevap kontrolü:
  * Doğru cevap: Grup-1~Grup-5 için +2 puan, Grup-6 ve sonrası için +1 puan
  * Yanlış cevap: -1 puan (puan 0'ın altına inemez)
* Her 20 puanda yeni seviyeye geçiş (Grup-1~Grup-5), Grup-6 ve sonrası için her 10 puanda seviye atlanır
* Grup-9 ve Grup-10'da her soru için zamanlayıcı (sırasıyla 10 sn ve 5 sn)
* Seviye atlamada konfeti animasyonu
* Cevap girişi için Enter tuşu desteği
* Puanlar `localStorage` ile tarayıcıda saklanır

## Kurulum ve Kullanım

1. `Azra_Math_Game.html` dosyasını bir web tarayıcısında açın.
2. Ana sayfada "Oyuna Başla" butonuna tıklayarak oyuna başlayabilirsiniz.
3. Sorulara doğru cevap vererek puan kazanmaya ve seviyeleri geçmeye çalışın.

## Geliştirme Önerileri

* Oyuna ses efektleri eklenebilir.
* Zaman sınırlı sorular veya günlük hedefler konabilir.
* Puan sistemine göre rozet veya ödül sistemi entegre edilebilir.

## Lisans

Bu proje kişisel eğitim ve eğlence amaçlıdır. Dilediğiniz gibi geliştirebilir ve kullanabilirsiniz.
