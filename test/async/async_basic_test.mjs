import assert from 'assert'
import { NakoCompiler } from '../../src/nako3.mjs'

describe('aysnc_basic_test', () => {
  // @ts-ignore
  const nako = new NakoCompiler()
  const cmp = (/** @type {string} */code, /** @type {string} */res) => {
    code = '!非同期モード\n' + code
    nako.logger.debug('code=' + code)
    assert.strictEqual(nako.run(code, '').log, res)
  }
  // --- test ---
  it('print simple', () => {
    cmp('3を表示', '3')
  })
  it('calc simple', () => {
    cmp('3*2を表示', '6')
  })
  it('let simple', () => {
    cmp('n=3;nを表示', '3')
    cmp('n=3;m=8;n*mを表示', '24')
  })
  // 関数
  it('js func simple c type', () => {
    cmp('n=INT(3.14);nを表示', '3')
    cmp('INT(3.14)を表示', '3')
  })
  it('js func replace', () => {
    cmp('「a,b,c」の「,」を「:」へ置換。それを表示。', 'a:b:c')
  })
  it('js func replace 連文', () => {
    cmp('「a,b,c」の「,」を「:」へ置換して表示。', 'a:b:c')
  })
  it('関数定義', () => {
    cmp('●(AとBの)積算処理とは\nA*Bで戻る。。。3と5の積算処理を表示', '15')
    cmp('●(AにBを)加算処理とは\nAにBを足す。。。3に5を加算処理して表示', '8')
  })
  it('無名関数定義', () => {
    cmp('A=●(AとBの)\nA/Bで戻る。。。A(9,3)を表示', '3')
  })
  it('関数定義(再帰)', () => {
    cmp('総数=0;●(Nの)再帰加算処理とは\nもしN<0ならば総数を戻す;総数=総数+N;(N-1)の再帰加算処理を戻す。。。10の再帰加算処理を表示', '55')
  })
  it('フィボナッチテスト(関数の再帰)', () => {
    cmp(
      '●FIB(N)とは\n' +
      '　　もしN<=2ならば、(N-1)で戻る\n' +
      '　　それ=FIB(N-1)+FIB(N-2)\n' +
      'ここまで。\n' +
      'FIB(15)を表示', '377')
  })
  // 条件分岐
  it('もし', () => {
    cmp('N=1;もしN=1ならば「OK」と表示。', 'OK')
    cmp('N=2;もしN=1ならば「NG」と表示。違えば「OK」と表示', 'OK')
    cmp('N=10;もしN>=5ならば「A」と表示。違えば「B」と表示', 'A')
    cmp('N=1;もしN>=5ならば「A」と表示。違えば「B」と表示', 'B')
  })
  it('もし、複数行', () => {
    cmp('N=1;もし、Nが3以上ならば\n"A"を表示\n違えば\n"B"を表示\n。。。', 'B')
  })
  it('もし、連続', () => {
    cmp('N=1;もしN=1ならば「OK」と表示。', 'OK')
    cmp('N=2;もしN=1ならば「1」と表示。違えばもしN=2ならば「2」と表示。違えばもしN=3ならば「3」と表示。違えば「その他」と表示。', '2')
    cmp('N=4;もしN=1ならば「1」と表示。違えばもしN=2ならば「2」と表示。違えばもしN=3ならば「3」と表示。違えば「その他」と表示。', 'その他')
  })
  it('条件分岐', () => {
    cmp('N=3;Nで条件分岐;1ならば"1"と表示💧2ならば"2"と表示💧3ならば"3"と表示💧違えば"*"と表示💧💧', '3')
    cmp('N=55;Nで条件分岐;1ならば"1"と表示💧2ならば"2"と表示💧3ならば"3"と表示💧違えば"*"と表示💧💧', '*')
  })
  // JSON
  it('JSON', () => {
    cmp('N=[10,20,30];N[0]を表示', '10')
    cmp('N={"mon":1,"tue":2,"wed":3};N["wed"]を表示', '3')
    cmp('N={"mon":[1,2,3],"tue":[4,5,6]};N["mon"][2]を表示', '3')
  })
  // 繰り返し
  it('繰り返し', () => {
    cmp('C=0;Nを1から10まで繰り返す;C=C+N;ここまで;Cを表示;', '55')
    cmp('C=0;10回,C=C+回数;Cを表示', '55')
    cmp('C=0;N=10;Nが0以上の間;C=C+N;N=N-1;ここまで;Cを表示', '55')
    cmp('C=0;N=[1,2,3,4,5,6,7,8,9,10];Nを反復;C=C+対象;ここまで;Cを表示', '55')
  })
  // 文字列の展開
  it('文字列の展開', () => {
    cmp('a=30;「abc{a}abc」を表示', 'abc30abc')
    cmp('a=30;「abc｛a｝abc」を表示', 'abc30abc')
  })
  // 定数
  it('システム定数', () => {
    cmp('ナデシコエンジンを表示', 'nadesi.com/v3')
  })
  it('助詞の後に句読点', () => {
    cmp('「こんにちは」と、表示。', 'こんにちは')
  })
  it('代入文', () => {
    cmp('3000を値段に代入。値段を表示', '3000')
    cmp('値段に3000を代入。値段を表示', '3000')
    cmp('々=3000。々を表示', '3000')
    cmp('々に3000を代入。々を表示', '3000')
  })
  it('連文後の代入文', () => {
    cmp('「aabbcc」の「aa」を「」に置換してFに代入。Fを表示', 'bbcc')
    cmp('「aabbcc」の「aa」を「」に置換して「bb」を「」に置換してFに代入。Fを表示', 'cc')
  })
  it('〜を〜に定める', () => {
    cmp('Aを0.8に定めてAを表示', '0.8')
  })
  it('文字列 - &と改行', () => {
    cmp('「aaa」& _\n「bbb」を表示。', 'aaabbb')
    cmp('A= 1 + 1 + 1 + 1 + 1 + _\n1 + 1\nAを表示', '7')
    cmp('A= 1 + 1 + 1 + 1 + 1 + _\r\n1 + 1 + 1\r\nAを表示', '8')
    cmp('A= 1 + 1 + 1 + 1 + 1 + _  \r\n1 + 3  \r\nAを表示', '9')
    cmp('A = 1 + _\n' +
      '    5 + _\n' +
      '    10\n' +
      'Aを表示。', '16')
  })
  it('名前に数字を持つ変数を使う', () => {
    cmp('A1=30;B1=20;「{A1}{B1}」を表示。', '3020')
  })
})
