/**
 * file: plugin_node.mjs
 * node.js のためのプラグイン
 */
import fs from 'fs'
import fse from 'fs-extra'
import fetch from 'node-fetch'
import { exec, execSync } from 'child_process'
import path from 'path'
import iconv from 'iconv-lite'
import opener from 'opener'
import clipboardy from 'clipboardy'
import assert from 'assert'
// 「標準入力取得時」「尋」で利用
import readline from 'readline'
// ハッシュ関数で利用
import crypto from 'crypto'
import os from 'os'
import sendkeysJS from 'sendkeys-js'
import { Func } from 'mocha'

export default {
  '初期化': {
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      sys.__getBinPath = (tool: any) => {
        let fpath = tool
        if (process.platform === 'win32') {
          if (!fileExists(tool)) {
            const nodeDir = path.dirname(process.argv[0])
            const root = path.resolve(path.join(nodeDir, '..'))
            fpath = path.join(root, 'bin', tool + '.exe')
            if (fileExists(fpath)) { return `"${fpath}"` }
            return tool
          }
        }

        return fpath
      }
      sys.__getBokanPath = () => {
        let nakofile
        const cmd = path.basename(process.argv[1])
        if (cmd.indexOf('cnako3') < 0) { nakofile = process.argv[1] } else { nakofile = process.argv[2] }

        return path.dirname(path.resolve(nakofile))
      }
      sys.__v0['コマンドライン'] = process.argv
      sys.__v0['ナデシコランタイムパス'] = process.argv[0]
      sys.__v0['ナデシコランタイム'] = path.basename(process.argv[0])
      sys.__v0['母艦パス'] = sys.__getBokanPath()
      sys.__v0['AJAX:ONERROR'] = null
    }
  },
  // @ファイル入出力
  '開': { // @ファイルSを開く // @ひらく
    type: 'func',
    josi: [['を', 'から']],
    pure: true,
    fn: function (s: string) {
      return fs.readFileSync(s, 'utf-8')
    }
  },
  '読': { // @ファイルSを開く // @よむ
    type: 'func',
    josi: [['を', 'から']],
    pure: false,
    fn: function (s: string, sys: any) {
      return sys.__exec('開', [s])
    }
  },
  'バイナリ読': { // @ファイルSをバイナリ(Buffer)として開く // @ばいなりよむ
    type: 'func',
    josi: [['を', 'から']],
    pure: true,
    fn: function (s: string, sys: any) {
      return fs.readFileSync(s)
    }
  },
  '保存': { // @データSをファイルFヘ書き込む // @ほぞん
    type: 'func',
    josi: [['を'], ['へ', 'に']],
    pure: true,
    fn: function (s: string, f: string) {
      // Buffer?
      if (typeof s === 'string') { fs.writeFileSync(f, s, 'utf-8') } else { fs.writeFileSync(f, s) }
    },
    return_none: true
  },
  'SJISファイル読': { // @SJIS形式のファイルSを読み込む // @SJISふぁいるよむ
    type: 'func',
    josi: [['を', 'から']],
    pure: true,
    fn: function (s: string, sys: any) {
      // iconv.skipDecodeWarning = true
      const buf = fs.readFileSync(s)
      const text = iconv.decode(Buffer.from(buf), 'sjis')
      return text
    }
  },
  'SJISファイル保存': { // @SをSJIS形式でファイルFへ書き込む // @SJISふぁいるほぞん
    type: 'func',
    josi: [['を'], ['へ', 'に']],
    pure: true,
    fn: function (s: string, f: string, sys: any) {
      // iconv.skipDecodeWarning = true
      const buf = iconv.encode(s, 'Shift_JIS')
      fs.writeFileSync(f, buf)
    },
    return_none: true
  },
  '起動待機': { // @シェルコマンドSを起動し実行終了まで待機する // @きどうたいき
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (s: string) {
      const r = execSync(s)
      return r.toString()
    }
  },
  '起動': { // @シェルコマンドSを起動 // @きどう
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (s: string) {
      exec(s, (err, stdout, stderr) => {
        if (err) { console.error(stderr) } else
        if (stdout) { console.log(stdout) }
      })
    }
  },
  '起動時': { // @シェルコマンドSを起動 // @きどうしたとき
    type: 'func',
    josi: [['で'], ['を']],
    pure: true,
    fn: function (callback: any, s: string, sys: any) {
      exec(s, (err, stdout, stderr) => {
        if (err) { throw new Error(stderr) } else { callback(stdout) }
      })
    }
  },
  'ブラウザ起動': { // @ブラウザでURLを起動 // @ぶらうざきどう
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (url: string) {
      opener(url)
    }
  },
  'ファイル列挙': { // @パスSのファイル名（フォルダ名）一覧を取得する。ワイルドカード可能。「*.jpg;*.png」など複数の拡張子を指定可能。 // @ふぁいるれっきょ
    type: 'func',
    josi: [['の', 'を', 'で']],
    pure: true,
    fn: function (s: string) {
      if (s.indexOf('*') >= 0) { // ワイルドカードがある場合
        const searchPath = path.dirname(s)
        const mask1 = path.basename(s)
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
        const mask2 = (mask1.indexOf(';') < 0)
          ? mask1 + '$'
          : '(' + mask1.replace(/;/g, '|') + ')$'
        const maskRE = new RegExp(mask2, 'i')
        const list = fs.readdirSync(searchPath)
        return list.filter((n) => maskRE.test(n))
      } else { return fs.readdirSync(s) }
    }
  },
  '全ファイル列挙': { // @パスS以下の全ファイル名を取得する。ワイルドカード可能。「*.jpg;*.png」のように複数の拡張子を指定可能。 // @ぜんふぁいるれっきょ
    type: 'func',
    josi: [['の', 'を', 'で']],
    pure: true,
    fn: function (s: string) {
      /** @type {string[]} */
      const result: string[] = []
      // ワイルドカードの有無を確認
      let mask = '.*'
      let basepath = s
      if (s.indexOf('*') >= 0) {
        basepath = path.dirname(s)
        const mask1 = path.basename(s)
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
        mask = (mask1.indexOf(';') < 0)
          ? mask1 + '$'
          : '(' + mask1.replace(/;/g, '|') + ')$'
      }
      basepath = path.resolve(basepath)
      const maskRE = new RegExp(mask, 'i')
      // 再帰関数を定義
      const enumR = (base: any) => {
        const list = fs.readdirSync(base)
        for (const f of list) {
          if (f === '.' || f === '..') { continue }
          const fullpath = path.join(base, f)
          let st = null
          try {
            st = fs.statSync(fullpath)
          } catch (e) {
            st = null
          }
          if (st == null) { continue }
          if (st.isDirectory()) {
            enumR(fullpath)
            continue
          }
          if (maskRE.test(f)) { result.push(fullpath) }
        }
      }
      // 検索実行
      enumR(basepath)
      return result
    }
  },
  '存在': { // @ファイルPATHが存在するか確認して返す // @そんざい
    type: 'func',
    josi: [['が', 'の']],
    pure: true,
    fn: function (path: string) {
      return fileExists(path)
    }
  },
  'フォルダ存在': { // @ディレクトリPATHが存在するか確認して返す // @ふぉるだそんざい
    type: 'func',
    josi: [['が', 'の']],
    pure: true,
    fn: function (path: string) {
      return isDir(path)
    }
  },
  'フォルダ作成': { // @ディレクトリPATHを作成して返す(再帰的に作成) // @ふぉるださくせい
    type: 'func',
    josi: [['の', 'を', 'に', 'へ']],
    pure: true,
    fn: function (path: string) {
      return fse.mkdirpSync(path)
    }
  },
  'ファイルコピー': { // @パスAをパスBへファイルコピーする // @ふぁいるこぴー
    type: 'func',
    josi: [['から', 'を'], ['に', 'へ']],
    pure: true,
    fn: function (a: string, b: string, sys: any) {
      return fse.copySync(a, b)
    }
  },
  'ファイルコピー時': { // @パスAをパスBへファイルコピーしてcallbackを実行 // @ふぁいるこぴーしたとき
    type: 'func',
    josi: [['で'], ['から', 'を'], ['に', 'へ']],
    pure: true,
    fn: function (callback: any, a: string, b: string, sys: any) {
      return fse.copy(a, b, (err: any) => {
        if (err) { throw new Error('ファイルコピー時:' + err) }
        callback()
      })
    },
    return_none: false
  },
  'ファイル移動': { // @パスAをパスBへ移動する // @ふぁいるいどう
    type: 'func',
    josi: [['から', 'を'], ['に', 'へ']],
    pure: true,
    fn: function (a: string, b: string, sys: any) {
      return fse.moveSync(a, b)
    }
  },
  'ファイル移動時': { // @パスAをパスBへ移動してcallbackを実行 // @ふぁいるいどうしたとき
    type: 'func',
    josi: [['で'], ['から', 'を'], ['に', 'へ']],
    pure: true,
    fn: function (callback: any, a: string, b: string, sys: any) {
      fse.move(a, b, (err: any) => {
        if (err) { throw new Error('ファイル移動時:' + err) }
        callback()
      })
    },
    return_none: false
  },
  'ファイル削除': { // @パスPATHを削除する // @ふぁいるさくじょ
    type: 'func',
    josi: [['の', 'を']],
    pure: true,
    fn: function (path: string, sys: any) {
      return fse.removeSync(path)
    }
  },
  'ファイル削除時': { // @パスPATHを削除してcallbackを実行 // @ふぁいるさくじょしたとき
    type: 'func',
    josi: [['で'], ['の', 'を']],
    pure: true,
    fn: function (callback: any, path: string, sys: any) {
      return fse.remove(path, (err: any) => {
        if (err) { throw new Error('ファイル削除時:' + err) }
        callback()
      })
    },
    return_none: false
  },
  'ファイル情報取得': { // @パスPATHの情報を調べてオブジェクトで返す // @ふぁいるじょうほうしゅとく
    type: 'func',
    josi: [['の', 'から']],
    pure: true,
    fn: function (path: string, sys: any) {
      return fs.statSync(path)
    }
  },
  'ファイルサイズ取得': { // @パスPATHのファイルサイズを調べて返す // @ふぁいるさいずしゅとく
    type: 'func',
    josi: [['の', 'から']],
    pure: true,
    fn: function (path: string, sys: any) {
      const st = fs.statSync(path)
      if (!st) { return -1 }
      return st.size
    }
  },
  // @パス操作
  'ファイル名抽出': { // @フルパスのファイル名Sからファイル名部分を抽出して返す // @ふぁいるめいちゅうしゅつ
    type: 'func',
    josi: [['から', 'の']],
    pure: true,
    fn: function (s: string) {
      return path.basename(s)
    }
  },
  'パス抽出': { // @ファイル名Sからパス部分を抽出して返す // @ぱすちゅうしゅつ
    type: 'func',
    josi: [['から', 'の']],
    pure: true,
    fn: function (s: string) {
      return path.dirname(s)
    }
  },
  '絶対パス変換': { // @相対パスから絶対パスに変換して返す // @ぜったいぱすへんかん
    type: 'func',
    josi: [['を', 'の']],
    pure: true,
    fn: function (a: string) {
      return path.resolve(a)
    }
  },
  '相対パス展開': { // @ファイル名AからパスBを展開して返す // @そうたいぱすてんかい
    type: 'func',
    josi: [['を'], ['で']],
    pure: true,
    fn: function (a: string, b: string) {
      return path.resolve(path.join(a, b))
    }
  },
  // @フォルダ取得
  'カレントディレクトリ取得': { // @カレントディレクトリを返す // @かれんとでぃれくとりしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function () {
      const cwd = process.cwd()
      return path.resolve(cwd)
    }
  },
  'カレントディレクトリ変更': { // @カレントディレクトリをDIRに変更する // @かれんとでぃれくとりへんこう
    type: 'func',
    josi: [['に', 'へ']],
    pure: true,
    fn: function (dir: string) {
      process.chdir(dir)
    },
    return_none: true
  },
  '作業フォルダ取得': { // @カレントディレクトリを返す // @さぎょうふぉるだしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function () {
      const cwd = process.cwd()
      return path.resolve(cwd)
    }
  },
  '作業フォルダ変更': { // @カレントディレクトリをDIRに変更する // @さぎょうふぉるだへんこう
    type: 'func',
    josi: [['に', 'へ']],
    pure: true,
    fn: function (dir: string) {
      process.chdir(dir)
    },
    return_none: true
  },
  'ホームディレクトリ取得': { // @ホームディレクトリを取得して返す // @ほーむでぃれくとりしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function () {
      return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
    }
  },
  'デスクトップ': { // @デスクトップパスを取得して返す // @ですくとっぷ
    type: 'func',
    josi: [],
    pure: false,
    fn: function (sys: any) {
      const home = sys.__exec('ホームディレクトリ取得', [sys])
      return path.join(home, 'Desktop')
    }
  },
  'マイドキュメント': { // @マイドキュメントのパスを取得して返す // @まいどきゅめんと
    type: 'func',
    josi: [],
    pure: false,
    fn: function (sys: any) {
      const home = sys.__exec('ホームディレクトリ取得', [sys])
      return path.join(home, 'Documents')
    }
  },
  '母艦パス': { type: 'const', value: '' }, // @ぼかんぱす
  '母艦パス取得': { // @スクリプトのあるディレクトリを返す // @ぼかんぱすしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      return sys.__getBokanPath()
    }
  },
  // @環境変数
  '環境変数取得': { // @環境変数Sを返す // @かんきょうへんすうしゅとく
    type: 'func',
    josi: [['の']],
    pure: true,
    fn: function (s: string) {
      return process.env[s]
    }
  },
  '環境変数一覧取得': { // @環境変数の一覧を返す // @かんきょうへんすういちらんしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function () {
      return process.env
    }
  },
  // @圧縮・解凍
  '圧縮解凍ツールパス': { type: 'const', value: '7z' }, // @あっしゅくかいとうつーるぱす
  '圧縮解凍ツールパス変更': { // @圧縮解凍に使うツールを取得変更する // @あっしゅくかいとうつーるぱすへんこう
    type: 'func',
    josi: [['に', 'へ']],
    pure: true,
    fn: function (v: string, sys: any) {
      sys.__v0['圧縮解凍ツールパス'] = v
    },
    return_none: true
  },
  '解凍': { // @(v1非互換)ZIPファイルAをBに解凍(実行には7-zipが必要-https://goo.gl/LmKswH) // @かいとう
    type: 'func',
    josi: [['を', 'から'], ['に', 'へ']],
    pure: true,
    fn: function (a: string, b: string, sys: any) {
      const tpath = sys.__getBinPath(sys.__v0['圧縮解凍ツールパス'])
      const cmd = `${tpath} x "${a}" -o"${b}" -y`
      execSync(cmd)
      return true
    }
  },
  '解凍時': { // @解凍処理を行い、処理が完了したときにcallback処理を実行 // @かいとうしたとき
    type: 'func',
    josi: [['で'], ['を', 'から'], ['に', 'へ']],
    pure: true,
    fn: function (callback: any, a: string, b: string, sys: any) {
      const tpath = sys.__getBinPath(sys.__v0['圧縮解凍ツールパス'])
      const cmd = `${tpath} x "${a}" -o"${b}" -y`
      exec(cmd, (err, stdout, stderr) => {
        if (err) { throw new Error('[エラー]『解凍時』' + err) }
        callback(stdout)
      })
    },
    return_none: false
  },
  '圧縮': { // @(v1非互換)ファイルAをBにZIP圧縮(実行には7-zipが必要-https://goo.gl/LmKswH) // @あっしゅく
    type: 'func',
    josi: [['を', 'から'], ['に', 'へ']],
    pure: true,
    fn: function (a: string, b: string, sys: any) {
      const tpath = sys.__getBinPath(sys.__v0['圧縮解凍ツールパス'])
      const cmd = `${tpath} a -r "${b}" "${a}" -y`
      execSync(cmd)
      return true
    }
  },
  '圧縮時': { // @圧縮処理を行い完了したときにcallback処理を指定 // @あっしゅくしたとき
    type: 'func',
    josi: [['で'], ['を', 'から'], ['に', 'へ']],
    pure: true,
    fn: function (callback: any, a: string, b: string, sys: any) {
      const tpath = sys.__getBinPath(sys.__v0['圧縮解凍ツールパス'])
      const cmd = `${tpath} a -r "${b}" "${a}" -y`
      exec(cmd, (err, stdout, stderr) => {
        if (err) { throw new Error('[エラー]『圧縮時』' + err) }
        callback(stdout)
      })
    },
    return_none: true
  },
  // @Nodeプロセス
  '終': { // @Nodeでプログラム実行を強制終了する // @おわる
    type: 'func',
    josi: [],
    pure: true,
    fn: function () {
      process.exit()
    },
    return_none: true
  },
  '強制終了時': { // @Nodeでctrl+cでプログラムの実行が終了した時FUNCを実行する。もしFUNCが偽を返すと終了しない。非同期処理のとき動作する(#1010) // @きょうせいしゅうりょうしたとき
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (func: any, sys: any) {
      if (typeof (func) === 'string') {
        func = sys.__findFunc(func, '強制終了時')
      }
      process.on('SIGINT', (signal) => {
        const flag = func(sys)
        if (flag) { process.exit() }
      })
    },
    return_none: true
  },
  '終了': { // @Nodeでプログラム実行を強制終了する // @しゅうりょう
    type: 'func',
    josi: [],
    pure: false,
    fn: function (sys: any) {
      sys.__exec('終', [])
    },
    return_none: true
  },
  'OS取得': { // @OSプラットフォームを返す(darwin/win32/linux) // @OSしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      return process.platform
    }
  },
  'OSアーキテクチャ取得': { // @OSアーキテクチャを返す // @OSあーきてくちゃしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      return process.arch
    }
  },
  // @クリップボード操作
  'クリップボード': { // @クリップボードを取得設定（『クリップボード←値』で書換が可能） // @くりっぷぼーど
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (v: string, sys: any) {
      // copy
      if (sys && sys.isSetter) { return clipboardy.writeSync(v) }
      // paste
      return clipboardy.readSync()
    }
  },
  // @コマンドラインと標準入出力
  'コマンドライン': { type: 'const', value: '' }, // @こまんどらいん
  'ナデシコランタイム': { type: 'const', value: '' }, // @なでしこらんたいむ
  'ナデシコランタイムパス': { type: 'const', value: '' }, // @なでしこらんたいむぱす
  '標準入力取得時': { // @標準入力を一行取得した時に、無名関数（あるいは、文字列で関数名を指定）F(s: string)を実行する // @ひょうじゅんにゅうりょくしゅとくしたとき
    type: 'func',
    josi: [['を']],
    pure: true,
    fn: function (callback: any) {
      const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      reader.on('line', function (line) {
        callback(line)
      })
    }
  },
  '尋': { // @標準入力を一行取得する // @たずねる
    type: 'func',
    josi: [['と', 'を']],
    pure: true,
    asyncFn: true,
    fn: function (msg: string): Promise<any> {
      return new Promise((resolve, reject) => {
        const rl = readline.createInterface(process.stdin, process.stdout)
        if (!rl) {
          reject(new Error('『尋』命令で標準入力が取得できません'))
          return
        }
        rl.question(msg, (buf: any) => {
          rl.close()
          if (buf && buf.match(/^[0-9.]+$/)) { buf = parseFloat(buf) }
          resolve(buf)
        })
      })
    }
  },
  // @テスト
  'ASSERT等': { // @ mochaによるテストで、ASSERTでAとBが正しいことを報告する // @ASSERTひとしい
    type: 'func',
    josi: [['と'], ['が']],
    pure: true,
    fn: function (a: any, b: any, sys: any) {
      assert.strictEqual(a, b)
    }
  },
  // @ネットワーク
  '自分IPアドレス取得': { // @ネットワークアダプターからIPアドレス(IPv4)を取得して配列で返す // @じぶんIPあどれすしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      const nif = os.networkInterfaces()
      if (!nif) { throw new Error('『自分IPアドレス取得』でネットワークのインターフェイスが種畜できません。') }
      /**
       * @type {string[]}
       */
      const result: string[] = []
      for (const dev in nif) {
        const n = nif[dev]
        if (!n) { continue }
        n.forEach((detail) => {
          if (detail.family === 'IPv4') { result.push(detail.address) }
        })
      }

      return result
    }
  },
  '自分IPV6アドレス取得': { // @ネットワークアダプターからIPアドレス(IPv6)を取得して配列で返す // @じぶんIPV6あどれすしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      const nif = os.networkInterfaces()
      if (!nif) { throw new Error('『自分IPアドレス取得』でネットワークのインターフェイスが種畜できません。') }
      const result: string[] = []
      for (const dev in nif) {
        const n = nif[dev]
        if (!n) { continue }
        n.forEach((detail) => {
          if (detail.family === 'IPv6') { result.push(detail.address) }
        })
      }

      return result
    }
  },
  // @Ajax
  'AJAX送信時': { // @非同期通信(Ajax)でURLにデータを送信し、成功するとcallbackが実行される。その際『対象』にデータが代入される。 // @AJAXそうしんしたとき
    type: 'func',
    josi: [['の'], ['まで', 'へ', 'に']],
    pure: true,
    fn: function (callback: any, url: string, sys: any) {
      let options = sys.__v0['AJAXオプション']
      if (options === '') { options = { method: 'GET' } }
      fetch(url, options).then((res: any) => {
        return res.text()
      }).then((text: string) => {
        sys.__v0['対象'] = text
        callback(text)
      }).catch((err: any) => {
        console.log('[fetch.error]', err)
        throw err
      })
    },
    return_none: true
  },
  'AJAX受信時': { // @非同期通信(Ajax)でURLにデータを送信し、成功するとcallbackが実行される。その際『対象』にデータが代入される。 // @AJAXそうしんしたとき
    type: 'func',
    josi: [['で'], ['から', 'を']],
    pure: true,
    fn: function (callback: any, url: string, sys: any) {
      sys.__exec('AJAX送信時', [callback, url, sys])
    },
    return_none: true
  },
  'GET送信時': { // @非同期通信(Ajax)でURLにデータを送信し、成功するとcallbackが実行される。その際『対象』にデータが代入される。 // @GETそうしんしたとき
    type: 'func',
    josi: [['の'], ['まで', 'へ', 'に']],
    pure: false,
    fn: function (callback: any, url: string, sys: any) {
      sys.__exec('AJAX送信時', [callback, url, sys])
    },
    return_none: true
  },
  'POST送信時': { // @AjaxでURLにPARAMSをPOST送信し『対象』にデータを設定 // @POSTそうしんしたとき
    type: 'func',
    josi: [['の'], ['まで', 'へ', 'に'], ['を']],
    pure: true,
    fn: function (callback: any, url: string, params: any, sys: any) {
      const flist = []
      for (const key in params) {
        const v = params[key]
        const kv = encodeURIComponent(key) + '=' + encodeURIComponent(v)
        flist.push(kv)
      }
      const bodyData = flist.join('&')
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
      }
      fetch(url, options).then((res: any) => {
        return res.text()
      }).then((text: string) => {
        sys.__v0['対象'] = text
        callback(text)
      }).catch((err: any) => {
        sys.__v0['AJAX:ONERROR'](err)
      })
    }
  },
  'POSTフォーム送信時': { // @AjaxでURLにPARAMSをフォームとしてPOST送信し『対象』にデータを設定 // @POSTふぉーむそうしんしたとき
    type: 'func',
    josi: [['の'], ['まで', 'へ', 'に'], ['を']],
    pure: true,
    fn: function (callback: any, url: string, params: any, sys: any) {
      const fd = new FormData()
      for (const key in params) { fd.set(key, params[key]) }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: fd
      }
      fetch(url, options).then((res: any) => {
        return res.text()
      }).then((text: string) => {
        sys.__v0['対象'] = text
        callback(text)
      }).catch((err: any) => {
        sys.__v0['AJAX:ONERROR'](err)
      })
    }
  },
  'AJAX失敗時': { // @Ajax命令でエラーが起きたとき // @AJAXえらーしっぱいしたとき
    type: 'func',
    josi: [['の']],
    pure: true,
    fn: function (callback: any, sys: any) {
      sys.__v0['AJAX:ONERROR'] = callback
    }
  },
  'AJAXオプション': { type: 'const', value: '' }, // @Ajax関連のオプションを指定 // @AJAXおぷしょん
  'AJAXオプション設定': { // @Ajax命令でオプションを設定 // @AJAXおぷしょんせってい
    type: 'func',
    josi: [['に', 'へ', 'と']],
    pure: true,
    fn: function (option: any, sys: any) {
      sys.__v0['AJAXオプション'] = option
    },
    return_none: true
  },
  'AJAX保障送信': { // @非同期通信(Ajax)でURLにデータの送信を開始する非同期処理オブジェクト(Promise)を作成する。 // @AJAXほしょうそうしん
    type: 'func',
    josi: [['まで', 'へ', 'に']],
    pure: true,
    fn: function (url: string, sys: any) {
      let options = sys.__v0['AJAXオプション']
      if (options === '') { options = { method: 'GET' } }
      return fetch(url, options)
    },
    return_none: false
  },
  'HTTP保障取得': { // @非同期通信(Ajax)でURLにデータの送信を開始する非同期処理オブジェクト(Promise)を作成する。 // @HTTPほしょうしゅとく
    type: 'func',
    josi: [['の', 'から', 'を']],
    pure: true,
    fn: function (url: string, sys: any) {
      return sys.__exec('AJAX保障送信', [url, sys])
    },
    return_none: false
  },
  'GET保障送信': { // @非同期通信(Ajax)でURLにデータの送信を開始する非同期処理オブジェクト(Promise)を作成する。 // @GETほしょうそうしん
    type: 'func',
    josi: [['まで', 'へ', 'に']],
    pure: true,
    fn: function (url: string, sys: any) {
      return sys.__exec('AJAX保障送信', [url, sys])
    },
    return_none: false
  },
  'POST保障送信': { // @非同期通信(Ajax)でURLにPARAMSをPOST送信を開始する非同期処理オブジェクト(Promise)を作成する。 // @POSTほしょうそうしん
    type: 'func',
    josi: [['まで', 'へ', 'に'], ['を']],
    pure: true,
    fn: function (url: string, params: any, sys: any) {
      const flist = []
      for (const key in params) {
        const v = params[key]
        const kv = encodeURIComponent(key) + '=' + encodeURIComponent(v)
        flist.push(kv)
      }
      const bodyData = flist.join('&')
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
      }
      return fetch(url, options)
    },
    return_none: false
  },
  'POSTフォーム保障送信': { // @非同期通信(Ajax)でURLにPARAMSをフォームとしてPOST送信を開始する非同期処理オブジェクト(Promise)を作成する。  // @POSTふぉーむほしょうそうしん
    type: 'func',
    josi: [['まで', 'へ', 'に'], ['を']],
    pure: true,
    fn: function (url: string, params: any, sys: any) {
      const fd = new FormData()
      for (const key in params) { fd.set(key, params[key]) }

      const options = {
        method: 'POST',
        body: fd
      }
      return fetch(url, options)
    },
    return_none: false
  },
  'AJAX内容取得': { // @非同期通信(Ajax)の応答から内容を指定した形式で取り出すための非同期処理オブジェクト(Promise)を返す。  // @AJAXないようしゅとく
    type: 'func',
    josi: [['から'], ['で']],
    pure: true,
    fn: function (res: any, type: string, sys: any) {
      type = type.toString().toUpperCase()
      if (type === 'TEXT' || type === 'テキスト') {
        return res.text()
      } else
      if (type === 'JSON') {
        return res.json()
      } else
      if (type === 'BLOB') {
        return res.blob()
      } else
      if (type === 'ARRAY' || type === '配列') {
        return res.arrayBuffer()
      } else
      if (type === 'BODY' || type === '本体') {
        return res.body
      }
      return res.body()
    },
    return_none: false
  },
  'AJAX受信': { // @「!非同期モード」で非同期通信(Ajax)でURLからデータを受信する。『AJAXオプション』を指定できる。結果は変数『対象』に入る// @AJAXじゅしん
    type: 'func',
    josi: [['から', 'を']],
    pure: true,
    fn: function (url: string, sys: any) {
      if (sys.__genMode !== '非同期モード') {
        throw new Error('『AJAX受信』を使うには、プログラムの冒頭で「!非同期モード」と宣言してください。')
      }
      const sysenv = sys.setAsync(sys)
      let options = sys.__v0['AJAXオプション']
      if (options === '') { options = { method: 'GET' } }
      // fetch 実行
      fetch(url, options).then((res: any) => {
        if (res.ok) { // 成功したとき
          return res.text()
        } else { // 失敗したとき
          throw new Error('status=' + res.status)
        }
      }).then((text: string) => {
        sys.__v0['対象'] = text
        sys.compAsync(sys, sysenv)
      }).catch((err: any) => {
        console.error('[AJAX受信のエラー]', err)
        sys.__errorAsync(err, sys)
      })
    },
    return_none: true
  },
  // @新AJAX
  'AJAXテキスト取得': { // @AJAXでURLにアクセスしテキスト形式で結果を得る。送信時AJAXオプションの値を参照。 // @AJAXてきすとしゅとく
    type: 'func',
    josi: [['から']],
    pure: true,
    asyncFn: true,
    fn: async function (url: string, sys: any) {
      let options = sys.__v0['AJAXオプション']
      if (options === '') { options = { method: 'GET' } }
      const res = await fetch(url, options)
      const txt = await res.text()
      return txt
    },
    return_none: false
  },
  'AJAX_JSON取得': { // @AJAXでURLにアクセスしJSONの結果を得て、送信時AJAXオプションの値を参照。 // @AJAX_JSONしゅとく
    type: 'func',
    josi: [['から']],
    pure: true,
    asyncFn: true,
    fn: async function (url: string, sys: any) {
      let options = sys.__v0['AJAXオプション']
      if (options === '') { options = { method: 'GET' } }
      const res = await fetch(url, options)
      const txt = await res.json()
      return txt
    },
    return_none: false
  },
  // @文字コード
  '文字コード変換サポート判定': { // @文字コードCODEをサポートしているか確認 // @もじこーどさぽーとはんてい
    type: 'func',
    josi: [['の', 'を']],
    pure: true,
    fn: function (code: string, sys: any) {
      return iconv.encodingExists(code)
    }
  },
  'SJIS変換': { // @(v1非互換)文字列をShift_JISのバイナリバッファに変換 // @SJISへんかん
    type: 'func',
    josi: [['に', 'へ', 'を']],
    pure: true,
    fn: function (str: string, sys: any) {
      // iconv.skipDecodeWarning = true
      return iconv.encode(str, 'Shift_JIS')
    }
  },
  'SJIS取得': { // @Shift_JISのバイナリバッファを文字列に変換 // @SJISしゅとく
    type: 'func',
    josi: [['から', 'を', 'で']],
    pure: true,
    fn: function (buf: any, sys: any) {
      // iconv.skipDecodeWarning = true
      return iconv.decode(Buffer.from(buf), 'sjis')
    }
  },
  'エンコーディング変換': { // @文字列SをCODEへ変換してバイナリバッファを返す // @ えんこーでぃんぐへんかん
    type: 'func',
    josi: [['を'], ['へ', 'で']],
    pure: true,
    fn: function (s: string, code: string, sys: any) {
      // iconv.skipDecodeWarning = true
      return iconv.encode(s, code)
    }
  },
  'エンコーディング取得': { // @バイナリバッファBUFをCODEから変換して返す // @えんこーでぃんぐしゅとく
    type: 'func',
    josi: [['を'], ['から', 'で']],
    pure: true,
    fn: function (buf: any, code: string, sys: any) {
      // iconv.skipDecodeWarning = true
      return iconv.decode(Buffer.from(buf), code)
    }
  },
  // @マウスとキーボード操作
  'キー送信': { // @Sのキーを送信 // @きーそうしん
    type: 'func',
    josi: [['を', 'の']],
    pure: true,
    fn: function (s: string, sys: any) {
      sendkeysJS.sendKeys(s)
    },
    return_none: true
  },
  '窓アクティブ': { // @Sの窓をアクティブにする // @まどあくてぃぶ
    type: 'func',
    josi: [['を', 'の']],
    pure: true,
    fn: function (s: string, sys: any) {
      sendkeysJS.activate(s)
    },
    return_none: true
  },
  // @ハッシュ関数
  'ハッシュ関数一覧取得': { // @利用可能なハッシュ関数の一覧を返す // @ はっしゅかんすういちらんしゅとく
    type: 'func',
    josi: [],
    pure: true,
    fn: function (sys: any) {
      return crypto.getHashes()
    }
  },
  'ハッシュ値計算': { // @データSをアルゴリズムALG(sha256/sha512/md5)のエンコーディングENC(hex/base64)でハッシュ値を計算して返す // @ はっしゅちけいさん
    type: 'func',
    josi: [['を'], ['の'], ['で']],
    pure: true,
    fn: function (s: any, alg: string, enc: any, sys: any) {
      const hashsum = crypto.createHash(alg)
      hashsum.update(s)
      return hashsum.digest(enc)
    }
  }
}

// ローカル関数
function fileExists (f: string): boolean {
  try {
    fs.statSync(f)
    return true
  } catch (err) {
    return false
  }
}

function isDir (f: string): boolean {
  try {
    const st = fs.statSync(f)
    return st.isDirectory()
  } catch (err) {
    return false
  }
}