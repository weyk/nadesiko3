import assert from 'assert'
import { NakoCompiler } from '../../src/nako3.mjs'

describe('error_test', () => {
  const nako = new NakoCompiler()
  // nako.logger.addListener('trace', ({ browserConsole }) => { console.log(...browserConsole) })
  const cmp = (/** @type {string} */ code, /** @type {string} */ res) => {
    nako.logger.debug('code=' + code)
    assert.strictEqual(nako.run(code).log, res)
  }
  // --- test ---
  it('エラー処理 - 基本', () => {
    cmp('123を表示', '123')
    cmp('エラー監視;「hoge」のエラー発生;エラーならば;「ERR」と表示;ここまで', 'ERR')
  })
})
