/* eslint-disable no-undef */
import assert from 'assert'
import { NakoCompiler } from '../src/nako3.mjs'

describe('flow_test', async () => {
  // nako.logger.addListener('trace', ({ browserConsole }) => { console.log(...browserConsole) })
  const cmp = async (/** @type {string} */ code, /** @type {string} */ res) => {
    const nako = new NakoCompiler()
    assert.strictEqual((await nako.runAsync(code, 'main.nako3')).log, res)
  }
  it('もし', async () => {
    await cmp('もし3>1ならば「あ」と表示。', 'あ')
    await cmp('もし3<1ならば「あ」と表示。違えば「い」と表示。', 'い')
  })
  it('もし - AがBならば', async () => {
    await cmp('もし3が3ならば\n「OK」と表示。\n違えば\n「NG」と表示。\nここまで\n', 'OK')
  })
  it('もし - ネスト', async () => {
    await cmp('A=5\n' +
      'もしAが3以上ならば\n' +
      '　　もしA=5ならば\n' +
      '　　　　「OK」と表示。\n' +
      '　　違えば\n' +
      '　　　　「NG」と表示。\n' +
      '　　ここまで。\n' +
      '違えば\n' +
      '　　「NG」と表示。\n' +
      'ここまで。\n', 'OK')
    await cmp('A=1\n' +
      'もしAが3以上ならば\n' +
      '　　もしA=5ならば\n' +
      '　　　　「NG」と表示。\n' +
      '　　違えば\n' +
      '　　　　「NG」と表示。\n' +
      '　　ここまで。\n' +
      '違えば\n' +
      '　　「OK」と表示。\n' +
      'ここまで。\n', 'OK')
  })
  it('もし - ネスト - 違えばの一致', async () => {
    await cmp('A=2\n' +
      'もしAが3以上ならば\n' +
      '　　もしA=5ならば\n' +
      '　　　　「NG」と表示。\n' +
      '　　ここまで\n' +
      '違えば\n' +
      '　　「OK」と表示。\n' +
      'ここまで。\n' +
      '', 'OK')
  })
  it('違えばもし', async () => {
    // 「違えば」の次がeolではないときfalse_blockが単文扱いになり「ここまで」が不要。
    await cmp('もし0ならば\n' +
        '    「NG」を表示\n' +
        '違えばもし0ならば\n' +
        '    「NG」を表示\n' +
        '違えばもし1ならば\n' +
        '    「OK」を表示\n' +
        '違えば\n' +
        '    「NG」を表示\n' +
        'ここまで\n', 'OK')

    await cmp('もし0ならば\n' +
        '    「NG」を表示\n' +
        '違えば、もし0ならば\n' +
        '    「NG」を表示\n' +
        '違えば、もし1ならば\n' +
        '    「OK」を表示\n' +
        '違えば\n' +
        '    「NG」を表示\n' +
        'ここまで\n', 'OK')
  })
  it('回', async () => {
    await cmp('3回「あ」と表示。', 'あ\nあ\nあ')
    await cmp('A=3;(A)回、Aを表示。', '3\n3\n3')
  })
  it('回、ここから', async () => {
    await cmp('A=3;(A)回、ここから\nAを表示。\nここまで\n', '3\n3\n3')
    await cmp('A=3;(A)回ここから\nAを表示。\nここまで\n', '3\n3\n3')
  })
  it('回、繰り返す(#924)', async () => {
    await cmp('A=3;(A)回、繰り返す\nAを表示。\nここまで\n', '3\n3\n3')
    await cmp('A=3;(A)回ここから、繰り返す\nAを表示。\nここまで\n', '3\n3\n3')
  })
  it('回繰り返す(#924)', async () => {
    await cmp('A=3;(A)回繰り返す\nAを表示。\nここまで\n', '3\n3\n3')
    await cmp('A=3;(A)回繰り返す、ここから\nAを表示。\nここまで\n', '3\n3\n3')
  })
  it('回 - 「それ」の自動挿入', async () => {
    await cmp('1と2を足す\n回\n1を表示\nここまで', '1\n1\n1')
  })
  it('の間', async () => {
    await cmp('N=3;\n(N>0)の間\nNを表示\nN=N-1\nここまで', '3\n2\n1')
  })
  it('の間、ここから', async () => {
    await cmp('N=3;\n(N>0)の間、ここから\nNを表示\nN=N-1\nここまで', '3\n2\n1')
    await cmp('N=3;\n(N>0)の間ここから\nNを表示\nN=N-1\nここまで', '3\n2\n1')
  })
  it('の間、繰り返す #927', async () => {
    await cmp('N=3;\n(N>0)の間、繰り返す\nNを表示\nN=N-1\nここまで', '3\n2\n1')
    await cmp('N=3;\n(N>0)の間繰り返す\nNを表示\nN=N-1\nここまで', '3\n2\n1')
  })
  it('一致する間', async () => {
    await cmp('●（AとBが）超一致するとは\n' +
        '    それはAとBが等しい\n' +
        'ここまで\n' +
        'a=1\n' +
        'i=0\n' +
        'aと1が超一致する間\n' +
        '    iを表示\n' +
        '    i=i+1\n' +
        '    もしiが3以上ならば\n' +
        '        a=0\n' +
        '    ここまで\n' +
        'ここまで',
    // ---
    '0\n1\n2')
  })
  it('等しい間', async () => {
    await cmp('a=1\n' +
        'i=0\n' +
        'aと1が等しい間\n' +
        '    iを表示\n' +
        '    i=i+1\n' +
        '    もしiが3以上ならば\n' +
        '        a=0\n' +
        '    ここまで\n' +
        'ここまで',
    // ---
    '0\n1\n2')
  })
  it('未満の間', async () => {
    await cmp('i=0\n' +
        'iが3未満の間\n' +
        '    iを表示\n' +
        '    i=i+1\n' +
        'ここまで',
    // ---
    '0\n1\n2')
  })
  it('超えの間', async () => {
    await cmp('i=0' +
        'iが-3超えの間\n' +
        '    iを表示\n' +
        '    i=i-1\n' +
        'ここまで',
    // ---
    '0\n-1\n-2')
  })
  it('範囲内の間', async () => {
    await cmp('i=0' +
        'iが-3から3の範囲内の間\n' +
        '    iを表示\n' +
        '    i=i+1\n' +
        'ここまで',
    // ---
    '0\n1\n2\n3')
  })
  it('繰り返す', async () => {
    await cmp('Nを1から3まで繰り返す\nNを表示\nここまで', '1\n2\n3')
    await cmp('Nを１から３まで繰り返す\n　　Nを表示\nここまで', '1\n2\n3')
  })
  it('繰り返す2', async () => {
    await cmp('1から3まで繰り返す\nそれを表示\nここまで', '1\n2\n3')
  })
  it('連続計算', async () => {
    await cmp('3に5を足してNに代入;Nを表示', '8')
    await cmp('3に5を足して2を掛けて表示', '16')
  })
  it('もし-日本語による比較', async () => {
    await cmp('もし3が3と等しいならば「OK」と表示。', 'OK')
    await cmp('もし(3+2)が5と等しいならば「OK」と表示。', 'OK')
    await cmp('もし(3+2)が1以上ならば「OK」と表示。', 'OK')
    await cmp('もし3が5未満ならば「OK」と表示。', 'OK')
    await cmp('もし(3+10)が(5+10)以下ならば「OK」と表示。', 'OK')
  })
  it('もし--一行文。違えば', async () => {
    await cmp('もし(3+10)が5以下ならば「ng」と表示。違えば「ok」と表示。', 'ok')
  })
  it('もし-しなければ', async () => {
    await cmp('もし{ "a": 30 }に「b」がハッシュキー存在しなければ\n「ok」と表示\nここまで', 'ok')
    await cmp('もし1と2が等しくなければ\n「ok」と表示\nここまで', 'ok')
  })
  it('回-break', async () => {
    await cmp('3回\n\'a\'と表示。もし(回数=2)ならば、抜ける;\n;ここまで;', 'a\na')
    await cmp('3回\n\'a\'と表示。もし、回数が2ならば、抜ける;\n;ここまで;', 'a\na')
  })
  it('反復 - 配列', async () => {
    await cmp('[1,2,3]を反復\n対象を表示\nここまで\n', '1\n2\n3')
  })
  it('反復 - オブジェクト', async () => {
    await cmp('{\'a\':1,\'b\':2,\'c\':3}を反復\n対象を表示\nここまで\n', '1\n2\n3')
    await cmp('{\'a\':1,\'b\':2,\'c\':3}を反復\n対象キーを表示\nここまで\n', 'a\nb\nc')
  })
  it('反復 - 変数付き', async () => {
    await cmp('A=[1,2,3];NでAを反復\nNを表示\nここまで\n', '1\n2\n3')
    await cmp('Nで[1,2,3]を反復\nNを表示\nここまで\n', '1\n2\n3')
  })
  it('反復2 - 変数付き', async () => {
    await cmp('A=[[3,30],[1,10],[2,20]];NでAを反復\nN[1]を表示\nここまで\n', '30\n10\n20')
  })
  it('反復 - prototypeを無視', async () => {
    await cmp('f=『function F(){}; F.prototype.foo = 20; const f = new F(); f.p1 = 10; f』をJS実行。fを反復して表示', '10')
  })
  it('ここから反復', async () => {
    await cmp('それは[1,2,3];ここから反復\n表示\nここまで\n', '1\n2\n3')
  })
  it('ここから繰り返し', async () => {
    await cmp('ここから1から3まで繰り返し\n表示\nここまで\n', '1\n2\n3')
  })
  it('ここから3回', async () => {
    await cmp('ここから3回\n表示\nここまで\n', '1\n2\n3')
  })
  it('不等号', async () => {
    await cmp('もし、5≧5ならば、「あ」と表示。', 'あ')
    await cmp('もし、5≧3ならば、「あ」と表示。', 'あ')
    await cmp('もし、5≦5ならば、「あ」と表示。', 'あ')
    await cmp('もし、3≦5ならば、「あ」と表示。', 'あ')
    await cmp('もし、5＝5ならば、「あ」と表示。', 'あ')
    await cmp('もし、3≠5ならば、「あ」と表示。', 'あ')
  })
  it('繰り返しのネスト', async () => {
    await cmp('C=0;Iを0から3まで繰り返す\nJを0から3まで繰り返す\nC=C+1;ここまで;ここまで;Cを表示', '16')
  })
  it('繰り返し:AからBまででA>Bの時', async () => {
    await cmp('Iを3から0まで繰り返す;Iを表示;ここまで', '3\n2\n1\n0')
    await cmp('Iを11から9まで繰り返す;Iを表示;ここまで', '11\n10\n9')
  })
  it('繰り返し:AからBまででA>Bの時', async () => {
    await cmp('Iを3から0まで繰り返す;Iを表示;ここまで', '3\n2\n1\n0')
    await cmp('Iを11から9まで繰り返す;Iを表示;ここまで', '11\n10\n9')
  })
  it('もし、と戻るの組み合わせ', async () => {
    await cmp('●テスト処理\n' +
        '　　「あ」と表示\n' +
        '　　もし、3=3ならば、戻る。\n' +
        '　　「ここには来ない」と表示\n' +
        'ここまで\n' +
        'テスト処理。', 'あ')
    await cmp('●(Sを)テスト処理\n' +
        '　　Sを大文字変換して表示。\n' +
        '　　もし、そうならば、戻る。\n' +
        '　　「ここには来ない」と表示\n' +
        'ここまで\n' +
        '「a」をテスト処理。', 'A')
  })
  it('もしと抜けるの組み合わせ', async () => {
    await cmp('Iを1から3まで繰り返す\n' +
        '　　「あ」と表示\n' +
        '　　もし、I=2ならば、抜ける。\n' +
        '　　「い」と表示\n' +
        'ここまで\n', 'あ\nい\nあ')
    await cmp('Iを1から3まで繰り返す\n' +
        '　　2回、「あ」と表示。\n' +
        '　　もし、I=2ならば、抜ける。\n' +
        '　　「い」と表示\n' +
        'ここまで\n', 'あ\nあ\nい\nあ\nあ')
    await cmp('Iを1から3まで繰り返す\n' +
        '　　「あ」と表示\n' +
        '　　もし、I=2ならば、「う」と表示して、抜ける。\n' +
        '　　「い」と表示\n' +
        'ここまで\n', 'あ\nい\nあ\nう')
  })
  it('もし文のエラー(#378)', async () => {
    await cmp('●AAAとは\n' +
        '　　列を1から3まで繰り返す。\n' +
        '   　　列を表示。' +
        '　　　　もし、列=2ならば、「*」と表示。\n' +
        '　　ここまで。\n' +
        'ここまで\n' +
        'AAA', '1\n2\n*\n3')
  })
  it('条件分岐(#694)', async () => {
    await cmp('2で条件分岐\n' +
        '  1ならば\n「a」と表示\nここまで\n' +
        '  2ならば\n「b」と表示\nここまで\n' +
        '  3ならば\n「c」と表示\nここまで\n' +
        '  違えば\n「d」と表示\nここまで\n' +
        'ここまで\n',
    'b')
    await cmp('3で条件分岐\n' +
    '  1ならば\n「a」と表示\nここまで\n' +
    '  2ならば\n「b」と表示\nここまで\n' +
    '  3ならば\n「c」と表示\nここまで\n' +
    '  違えば\n「d」と表示\nここまで\n' +
    'ここまで\n',
    'c')
    await cmp('5で条件分岐\n' +
    '  1ならば\n「a」と表示\nここまで\n' +
    '  2ならば\n「b」と表示\nここまで\n' +
    '  3ならば\n「c」と表示\nここまで\n' +
    '  違えば\n「d」と表示\nここまで\n' +
    'ここまで\n',
    'd')
  })
  it('条件分岐で違えばを省略', async () => {
    await cmp('2で条件分岐\n' +
        '  1ならば\n「a」と表示\nここまで\n' +
        '  2ならば\n「b」と表示\nここまで\n' +
        '  3ならば\n「c」と表示\nここまで\n' +
        'ここまで\n',
    'b')
    await cmp('5で条件分岐\n' +
    '  1ならば\n「a」と表示\nここまで\n' +
    '  2ならば\n「b」と表示\nここまで\n' +
    '  3ならば\n「c」と表示\nここまで\n' +
    'ここまで\n',
    '')
  })
  it('条件分岐で違えばの後にカンマがあってもエラーにならない #942', async () => {
    await cmp('A=0;2で条件分岐\n' +
        '  1ならば、A=A+1\nここまで\n' +
        '  2ならば、A=A+2\nここまで\n' +
        '  3ならば、A=A+3\nここまで\n' +
        '  違えば、A=A+10\nここまで\n' +
        'ここまで\nAを表示',
    '2')
  })
  it('N回をN|回に分ける', async () => {
    await cmp('S="";N=3;N回、S=S&"a";Sを表示。', 'aaa')
    await cmp('S="";N=3;N回\nS=S&"a";💧;Sを表示。', 'aaa')
  })
  it('「、」と「，」の違いが分かりづらい #877', async () => {
    await cmp('もし,0ならば,\n' +
        '    「NG」を表示\n' +
        '違えば,もし,0ならば\n' +
        '    「NG」を表示\n' +
        '違えば,もし,1ならば\n' +
        '    「OK」を表示\n' +
        '違えば,\n' +
        '    「NG」を表示\n' +
        'ここまで\n', 'OK')
    await cmp('S="";[1,2,3]を,反復,\n' +
        '    S=S&対象\n' +
        'ここまで。Sを表示。\n', '123')
    await cmp('S="";[1,2,3]を,反復,ここから,\n' +
        '    S=S&対象\n' +
        'ここまで。Sを表示。\n', '123')
  })
  it('「。。。」＝「ここまで」#925', async () => {
    await cmp('S="";3回;S=S&"a";;;Sを表示。', 'aaa')
    await cmp('A=0;3回\nA=A+1;;;Aを表示。', '3')
    await cmp(
      'A=0;3回\n' +
      '  A=A+1;\n' +
      '  A=A+1;\n' +
      '。。。;Aを表示。', '6')
    await cmp(
      'S=「」。3回\n' +
      '  S=S&「a」\n' +
      '  S=S&「b」。。。\n' +
      'Sを表示。\n', 'ababab')
  })
  it('「或いは」「あるいは」を追加#987', async () => {
    await cmp('A=3;もし、A=3或いはA=5あるいはA=7ならば「OK」と表示。違えば「NG」と表示。', 'OK')
    await cmp('A=3;もし、A=5あるいはA=3ならば「OK」と表示。違えば「NG」と表示。', 'OK')
    await cmp('A=空;B=3;もし(A=空)あるいは(B=空)ならば、"OK"と表示;違えば「NG」と表示。', 'OK')
  })
  it('「増繰り返す」「減繰り返す」を追加#1140', async () => {
    await cmp('Nを0から4まで2ずつ増やし繰り返す\nNを表示\nここまで\n', '0\n2\n4')
    await cmp('A=2;Nを0から4までAずつ増やし繰り返す\nNを表示\nここまで\n', '0\n2\n4')
    await cmp('Nを4から0まで2ずつ減らし繰り返す\nNを表示\nここまで\n', '4\n2\n0')
  })
  it('「増やして繰り返す」「減らして繰り返す」を追加#1140', async () => {
    // トークンをスタックからポップして処理するので確認
    await cmp('Nを0から4まで2ずつ増やして繰り返す\nNを表示\nここまで\n', '0\n2\n4')
    await cmp('A=2;Nを0から4までAずつ増やして繰り返す\nNを表示\nここまで\n', '0\n2\n4')
    await cmp('Nを4から0まで2ずつ減らして繰り返す\nNを表示\nここまで\n', '4\n2\n0')
  })
  it('ならばの直前に空白があるとエラー(#1141)', async () => {
    await cmp('A=30。もし、A>5 ならば、「OK」と表示。', 'OK')
  })
  it('-1を含む「もし」文が動かない core #47', async () => {
    await cmp(
      'A=0; もし、A != -1ならば\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
  })
  it('「もし」...「でなければ」', async () => {
    await cmp(
      'A=0; もし、A==-1でなければ\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
    await cmp(
      'A=0; もし、INT(A)==-1でなければ\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
    await cmp(
      'A=0; もし、Aが-1でなければ\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
    await cmp(
      'A=0; もし、Aが-5以下でなければ\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
  })
  it('「もし」AがBならば', async () => {
    await cmp(
      'A=0; もし、Aが0ならば\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
    await cmp(
      'A=0; もし、INT(A)が0ならば\n' +
      '　　「あ」と表示\n' +
      'ここまで\n' +
      '', 'あ')
  })
  it('「AからBまでNずつ増やし繰り返す」文でBからAまでも実行してしまう問題 #79', async () => {
    await cmp(
      'A="";Nを3から1まで繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '321')
    // 増やすのに減らさない
    await cmp(
      'A="";Nを3から1まで1ずつ増やし繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '')
    await cmp(
      'A="";Nを3から1まで1ずつ減らし繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '321')
  })
  it('「AからBまでNずつ減らし繰り返す」文でBからAまでも実行してしまう問題 #1753', async () => {
    await cmp(
      'A="";Nを1から3まで繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '123')
    // 増やすのに減らさない
    await cmp(
      'A="";Nを1から3まで1ずつ増やし繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '123')
    await cmp(
      'A="";Nを1から3まで1ずつ減らし繰り返す\n' +
      '　　A=A&N\n' +
      'ここまで\n' +
      'Aを表示;', '')
  })
  it('もしの省略を実装する nadesiko3#1604', async () => {
    await cmp(
      'A=10;Aが10と一致するならば\n' +
      '　　「OK」と表示\n' +
      'ここまで\n' +
      '', 'OK')
    await cmp(
      'A=10;Aが9と一致するならば\n' +
      '　　「NG2」と表示\n' +
      '違えば\n' +
      '　　「OK2」と表示\n' +
      'ここまで\n' +
      '', 'OK2')
    await cmp(
      'A=10;Aが10と等しいならば、「OK3」と表示。\n' +
      '', 'OK3')
  })
  it('範囲オブジェクトを指定した繰り返し #1704', async () => {
    await cmp('N=0;1…3を繰り返す\nN=N+それ;\nここまで;Nを表示。', '6')
    await cmp('N=「」;1から3の範囲を繰り返す\nN=N&それ;\nここまで;Nを表示。', '123')
    await cmp('N=「」;0…9を繰り返す\nN=N&それ;\nここまで;Nを表示。', '0123456789')
  })
  it('対象がローカル変数になっていた問題 #1723', async () => {
    await cmp('関数 Fとは; [1]を反復; ここまで。対象=1;ここまで；対象＝50;F；対象を表示。', '1')
  })
  it('多重ループ内の反復で、回数や対象の値を復元するように配慮する #1735', async () => {
    // 回: 回数
    await cmp('2回;TMP=回数;2回「i{回数}」を表示;「o{TMP}={回数}」を表示;ここまで。', 'i1\ni2\no1=1\ni1\ni2\no2=2')
    // 回: それ
    await cmp('2回;TMP=それ;2回「i{それ}」を表示;「o{TMP}={それ}」を表示;ここまで。', 'i1\ni2\no1=1\ni1\ni2\no2=2')
    // 反復: 対象
    await cmp('[1,2]を反復;TMP=対象;[4]を反復,「i{対象}」を表示;「o{TMP}={対象}」を表示;ここまで;', 'i4\no1=1\ni4\no2=2')
    // 反復: 対象キー
    await cmp('[1,2]を反復;TMP=対象キー;[4]を反復,「i{対象キー}」を表示;「o{TMP}={対象キー}」を表示;ここまで;', 'i0\no0=0\ni0\no1=1')
    // 反復: それ
    await cmp('[1,2]を反復;TMP=それ;[4]を反復,「i{それ}」を表示;「o{TMP}={それ}」を表示;ここまで;', 'i4\no1=1\ni4\no2=2')
  })
})
