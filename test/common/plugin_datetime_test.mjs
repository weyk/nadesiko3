/* eslint-disable no-undef */
import assert from 'assert'
import { NakoCompiler } from '../../src/nako3.mjs'
import { NakoRuntimeError } from '../../src/nako_errors.mjs'
import PluginDateTime from '../../src/plugin_datetime.mjs'

// eslint-disable-next-line no-undef
describe('plugin_datetime_test', () => {
  const nako = new NakoCompiler()
  // nako.logger.addListener('trace', ({ browserConsole }) => { console.log(...browserConsole) })
  nako.addPluginObject('PluginDateTime', PluginDateTime)

  const cmp = (/** @type {string} */ code, /** @type {string} */ res) => {
    nako.logger.debug('code=' + code)
    assert.strictEqual(nako.run(code).log, res)
  }
  const cmd = (/** @type {string} */ code) => {
    nako.logger.debug('code=' + code)
    nako.run(code)
  }

  // --- test ---
  it('日時', () => {
    cmp('「2017/03/06」の曜日。それを表示', '月')
    cmp('「2017/03/06」の曜日番号取得。それを表示', '1')
    cmp('「2017/03/06 00:00:00」をUNIX時間変換して表示', '1488726000')
    cmp('「2017/03/06 00:00:01」をUNIX時間変換して表示', '1488726001')
    cmp('「2017/03/06 00:00:00」をUNIXTIME変換して表示', '1488726000')
    cmp('「2017/03/06 00:00:01」をUNIXTIME変換して表示', '1488726001')
    cmp('1488726000を日時変換して表示', '2017/03/06 00:00:00')
    cmp('1504191600を日時変換して表示', '2017/09/01 00:00:00')
  })
  it('日時差', () => {
    cmp('「2017/03/06」から「2018/03/06」までの年数差。それを表示', '1')
    cmp('「2017/03/06」と「2018/03/06」の年数差。それを表示', '1')
    cmp('「2018/03/06」から「2017/03/06」までの年数差。それを表示', '-1')
    cmp('「2018/03/06」と「2017/03/06」の年数差。それを表示', '-1')
    cmp('「2017/03/06」から「2017/04/06」までの月数差。それを表示', '1')
    cmp('「2017/03/06」と「2017/04/06」の月数差。それを表示', '1')
    cmp('「2017/04/06」から「2017/03/06」までの月数差。それを表示', '-1')
    cmp('「2017/04/06」と「2017/03/06」の月数差。それを表示', '-1')
    cmp('「2017/03/06」から「2017/04/06」までの日数差。それを表示', '31')
    cmp('「2017/03/06」と「2017/04/06」の日数差。それを表示', '31')
    cmp('「2017/04/06」から「2017/03/06」までの日数差。それを表示', '-31')
    cmp('「2017/04/06」と「2017/03/06」の日数差。それを表示', '-31')
    cmp('「2017/03/06 00:00:00」から「2017/03/06 12:00:00」までの時間差。それを表示', '12')
    cmp('「2017/03/06 00:00:00」と「2017/03/06 12:00:00」の時間差。それを表示', '12')
    cmp('「00:00:00」から「12:00:00」までの時間差。それを表示', '12')
    cmp('「00:00:00」と「12:00:00」の時間差。それを表示', '12')
    cmp('「2017/03/06 12:00:00」から「2017/03/06 00:00:00」までの時間差。それを表示', '-12')
    cmp('「2017/03/06 12:00:00」と「2017/03/06 00:00:00」の時間差。それを表示', '-12')
    cmp('「12:00:00」から「00:00:00」までの時間差。それを表示', '-12')
    cmp('「12:00:00」と「00:00:00」の時間差。それを表示', '-12')
    cmp('「2017/03/06 00:00:00」から「2017/03/06 00:59:00」までの分差。それを表示', '59')
    cmp('「2017/03/06 00:00:00」と「2017/03/06 00:59:00」の分差。それを表示', '59')
    cmp('「00:00:00」から「00:59:00」までの分差。それを表示', '59')
    cmp('「00:00:00」と「00:59:00」の分差。それを表示', '59')
    cmp('「2017/03/06 00:59:00」から「2017/03/06 00:00:00」までの分差。それを表示', '-59')
    cmp('「2017/03/06 00:59:00」と「2017/03/06 00:00:00」の分差。それを表示', '-59')
    cmp('「00:59:00」から「00:00:00」までの分差。それを表示', '-59')
    cmp('「00:59:00」と「00:00:00」の分差。それを表示', '-59')
    cmp('「2017/03/06 00:00:00」から「2017/03/06 00:00:59」までの秒差。それを表示', '59')
    cmp('「2017/03/06 00:00:00」と「2017/03/06 00:00:59」の秒差。それを表示', '59')
    cmp('「00:00:00」から「00:00:59」までの秒差。それを表示', '59')
    cmp('「00:00:00」と「00:00:59」の秒差。それを表示', '59')
    cmp('「2017/03/06 00:00:59」から「2017/03/06 00:00:00」までの秒差。それを表示', '-59')
    cmp('「2017/03/06 00:00:59」と「2017/03/06 00:00:00」の秒差。それを表示', '-59')
    cmp('「00:00:59」から「00:00:00」までの秒差。それを表示', '-59')
    cmp('「00:00:59」と「00:00:00」の秒差。それを表示', '-59')
    cmp('「2020/07/17 00:00:00」と「2020/07/18 00:00:00」の「時間」による日時差を表示', '24')
  })
  it('日時加算', () => {
    cmp('「2017/03/06 00:00:01」に「+01:02:03」を時間加算。それを表示', '2017/03/06 01:02:04')
    cmp('「00:00:01」に「+01:02:03」を時間加算。それを表示', '01:02:04')
    cmp('「2017/03/06 00:00:01」に「-01:02:03」を時間加算。それを表示', '2017/03/05 22:57:58')
    cmp('「00:00:01」に「-01:02:03」を時間加算。それを表示', '22:57:58')
    cmp('「2017/03/06 00:00:01」に「+1年」を日時加算。それを表示', '2018/03/06 00:00:01')
    cmp('「2017/03/06」に「+1年」を日時加算。それを表示', '2018/03/06')
    cmp('「2017/03/06 00:00:01」に「+1ヶ月」を日時加算。それを表示', '2017/04/06 00:00:01')
    cmp('「2017/03/06」に「+1ヶ月」を日時加算。それを表示', '2017/04/06')
    cmp('「2017/03/06 00:00:01」に「+1日」を日時加算。それを表示', '2017/03/07 00:00:01')
    cmp('「2017/03/06」に「+1日」を日時加算。それを表示', '2017/03/07')
    cmp('「2017/03/06 00:00:01」に「+1時間」を日時加算。それを表示', '2017/03/06 01:00:01')
    cmp('「00:00:01」に「+1時間」を日時加算。それを表示', '01:00:01')
    cmp('「2017/03/06 00:00:01」に「+2分」を日時加算。それを表示', '2017/03/06 00:02:01')
    cmp('「00:00:01」に「+2分」を日時加算。それを表示', '00:02:01')
    cmp('「2017/03/06 00:00:01」に「+3秒」を日時加算。それを表示', '2017/03/06 00:00:04')
    cmp('「00:00:01」に「+3秒」を日時加算。それを表示', '00:00:04')
    cmp('「2017/03/06 00:00:01」に「-1年」を日時加算。それを表示', '2016/03/06 00:00:01')
    cmp('「2017/03/06」に「-1年」を日時加算。それを表示', '2016/03/06')
    cmp('「2017/03/06 00:00:01」に「-1ヶ月」を日時加算。それを表示', '2017/02/06 00:00:01')
    cmp('「2017/03/06」に「-1ヶ月」を日時加算。それを表示', '2017/02/06')
    cmp('「2017/03/06 00:00:01」に「-1日」を日時加算。それを表示', '2017/03/05 00:00:01')
    cmp('「2017/03/06」に「-1日」を日時加算。それを表示', '2017/03/05')
    cmp('「2017/03/06 00:00:01」に「-1時間」を日時加算。それを表示', '2017/03/05 23:00:01')
    cmp('「00:00:01」に「-1時間」を日時加算。それを表示', '23:00:01')
    cmp('「2017/03/06 00:00:01」に「-2分」を日時加算。それを表示', '2017/03/05 23:58:01')
    cmp('「00:00:01」に「-2分」を日時加算。それを表示', '23:58:01')
    cmp('「2017/03/06 00:00:01」に「-3秒」を日時加算。それを表示', '2017/03/05 23:59:58')
    cmp('「00:00:01」に「-3秒」を日時加算。それを表示', '23:59:58')
    cmp('「2017/03/06 00:00:01」に「+0001/02/03」を日付加算。それを表示', '2018/05/09 00:00:01')
    cmp('「2017/03/06」に「+0001/02/03」を日付加算。それを表示', '2018/05/09')
    cmp('「2017/03/06 00:00:01」に「-0001/02/03」を日付加算。それを表示', '2016/01/03 00:00:01')
    cmp('「2017/03/06」に「-0001/02/03」を日付加算。それを表示', '2016/01/03')
  })
  it('元号データ, 和暦変換', () => {
    assert.throws(
      () => cmd('「1868/10/22」を和暦変換。それを表示'),
      NakoRuntimeError,
      '『和暦変換』は明治以前の日付には対応していません。'
    )
    cmp('「1868/10/23」を和暦変換。それを表示', '明治元/10/23')
    cmp('「1912/07/29」を和暦変換。それを表示', '明治45/07/29')
    cmp('「1912/07/30」を和暦変換。それを表示', '大正元/07/30')
    cmp('「1926/12/24」を和暦変換。それを表示', '大正15/12/24')
    cmp('「1926/12/25」を和暦変換。それを表示', '昭和元/12/25')
    cmp('「1989/01/07」を和暦変換。それを表示', '昭和64/01/07')
    cmp('「1989/01/08」を和暦変換。それを表示', '平成元/01/08')
    cmp('「2019/04/30」を和暦変換。それを表示', '平成31/04/30')
    cmp('「2019/05/01」を和暦変換。それを表示', '令和元/05/01')
  })
})
