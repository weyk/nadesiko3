# nadesiko3

Japanese Programming Language Nadesiko v3 

# なでしこ3

現在鋭意開発中です。

# 開発目標

- 母国語に特化したプログラミング言語
- 教育用途に特化
- Webブラウザで手軽に試せること

## 開発物の予定

- 動物やキャラクターを動かしたり、お絵かきできるようにする
- ラズパイ上で動かし、電子工作が楽しめるようにする
- 簡単なWebエディタを作り、最小限の文字入力でプログラミングできるように

## 開発手順

- 1.条件分岐、繰り返しなど、まずは簡単な言語を制作
- 2.次に簡単なエディタを制作(安価なレンタルサーバーで動かせるように)
- 3.ライブラリやAPIなどモジュールを追加していく

## 開発言語

- ブラウザで動かすために、基本はJSで作る(/src/lang)
- エディタやサーバー側APIは、PHPで作る(/src/editor)

## 対応ブラウザ

- HTML5対応ブラウザ (Internet Explorer / Safari / Chrome / Firefox 等)
- スマホブラウザ (iOS Safari / Android標準ブラウザ)

## 電子工作支援ツールとして

- ラズベリーパイ向けのライブラリを用意する
- GPIOの入出力

## PC向けバッチ処理ツールとして

- なでしこv1で得たノウハウを、macOS/Linuxでも活用できるようにする
