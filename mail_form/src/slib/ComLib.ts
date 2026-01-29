// src/ComLib.ts

import { access } from 'fs/promises';
//import { unlink,rename,chmod } from 'node:fs/promises';
//import { unlink,rename,chmod } from 'fs/promises';

import * as fsp from 'fs/promises';
import * as fs from 'fs';
// ファイルロック用
//import { lock, unlock,check } from 'proper-lockfile';
import * as loc from 'proper-lockfile';

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath); // ファイルが存在すれば成功、なければエラー
    return true;
    console.log("ファイルは存在します。"); // 実際にはtryブロック内でreturn
  } catch (error) {
    // ファイルが存在しない場合はENOENTエラーが発生します
    return false;
    console.log("ファイルは存在しません。"); // 実際にはcatchブロック内でreturn
  }
}

async function deleteFile(filePath: string): Promise<void> {
  try {
    await fsp.unlink(filePath);
    console.log(`ファイルが削除されました: ${filePath}`);
  } catch (error) {
    console.error(`削除エラー: ${error}`);
  }
}

async function renameFile(oldPath: string, newPath: string): Promise<void> {
  try {
    await fsp.rename(oldPath, newPath);
    console.log('名前の変更が完了しました');
  } catch (error: any) {
    console.error(`エラーが発生しました: ${error.message}`);
  }
}

async function changePermission(path: string, octalNumber: number) {
  try {
    // 例: 所有者に読取・書込・実行権限、その他に読取・実行権限 (755)
    //await chmod(path, 0o755);
    await fsp.chmod(path, octalNumber);
    console.log('権限を変更しました');
  } catch (error: any) {
    console.error(`エラー: ${error.message}`);
  }
}


function encodeHtml(str: string): string {
  const map: { [key: string]: string } = {
    ',': '&#44;',
    '=': '&#61;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[,=&<>"']/g, (m) => {
    if(map[m] != undefined)
      return map[m];
    else return m;
  });
}
// call 方法
//const result = encodeHtml("a,b=c");
//console.log(result); // "a&#44;b&#61;c"

function decodeHtml(str: string): string {
  const map: { [key: string]: string } = {
    '&#44;': ',',
    '&#61;': '=',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  // 特定のマップに加え、数値参照 (&#数値;) も一括で置換する場合
  return str.replace(/&(#?\w+);/g, (match, p1) => {
    if (map[match]) return map[match];
    if (p1.startsWith('#')) {
      return String.fromCharCode(parseInt(p1.substring(1), 10));
    }
    return match;
  });
}

//const result = decodeHtml("a&#44;b&#61;c");
//console.log(result); // "a,b=c"


// ファイルが存在しない場合に空ファイルを作成しておく（ロックに必要）
async function ensureFile(lock_path:string) {
  //try {
    //await fs.access(lock_filePath);
    await fs.access(lock_path, fs.constants.F_OK | fs.constants.R_OK, (err) => {
        if (err) {
            console.error('File does not exist or is not readable');
            return false;
        } 
        else {
            console.log('File is readable');
            return false;
        }
    });
    await fs.writeFile(lock_path, '', 'utf-8',(err) =>{
        if (err) {
            console.error('An error occurred:', err);
            return false;
        }
        else
            return true;
    });
  //} 
  //catch {
    //await fs.writeFile(lock_filePath, '', 'utf-8');
  //}
}

//---------
//	Text ファイルの読み込み
//	入力パラメータ
//    obj = { rec: string };
//      rec : 読み込みレコード
//    filePath:string
//    lock_filePath:string
//	出力情報
//		$rc_s : エラーメッセージ
//
// how to call
//  let obj = {rec:''};
//  const rc_s = await readTextFile(obj,filePath,);
//---------
async function readTextFile(obj:{rec:string},filePath:string,lock_filePath:string): Promise<string> {
  //const content = 'こんにちは、TypeScriptでファイル書き込み！';
  //const filePath = './output.txt';
  let release;
  let rc_s:string='';
  const stale_max:number = 60000; // [ms]
  // 非同期処理の、fs.promises.readFile(fs/promises) を使った async/await 形式を使うこと
  try {
    // 古いロックがあるかチェック、nnn[ms] 以上ならstale とみなす
    const isLocked = await loc.check(lock_filePath, { stale: stale_max });
    if (isLocked) {
      console.error('readTextFile(): #3 check エラー');
      // 必要に応じて古いファイルを強制削除
      await loc.unlock(lock_filePath); 
    }
    // 1. ロックを取得 (ファイルが使用中の場合はエラー、またはリトライ設定が可能)
    // retries: リトライ回数と間隔の設定
    release = await loc.lock(lock_filePath, {
      // stale: nnn [ms]
      // ロック作成から nnn[ms] 以上経過していれば、そのロックは「死んでいる」とみなして破棄する
      // デフォルトの stale 設定は 10,000ms（10秒） --> 効かないみたい!!
      //update: 2000,  // 2秒ごとに生存確認を更新する
      retries: { retries: 5, minTimeout: 100 } });
    // ファイルを読み込む（'utf8' を指定して文字列として取得）
    obj.rec = await fsp.readFile(filePath, 'utf8');
  } 
  catch (error) {
    console.error('ロック取得失敗またはファイル操作エラー:', error);
    rc_s='エラー:'+error;
  }
  finally {
      // 3. 必ずロックを解除する
      if (release) {
          await release();
      }
  }
  return rc_s;
}
//---------
// Text ファイルの書き込み
//	入力パラメータ
//    rec:string
//    filePath:string
//    lock_filePath:string
//	出力情報
//		$rc_s : エラーメッセージ
//
// how to call
//  const rc_s = awit writeTextFile(rec,filePath,lock_filePath);
//---------
async function writeTextFile(rec:string,filePath:string,lock_filePath:string): Promise<string> {
  //const content = 'こんにちは、TypeScriptでファイル書き込み！';
  //const filePath = './output.txt';
  let release;
  let rc_s:string='';
  const stale_max:number = 60000;
  // 非同期処理の、fs.promises.writeFile(fs/promises) を使った async/await 形式を使うこと
  try {
    // 古いロックがあるかチェック、nnn[ms] 以上ならstale とみなす
    const isLocked = await loc.check(lock_filePath, { stale: stale_max });
    if (isLocked) {
      console.error('writeTextFile(): #3 check エラー');
      // 必要に応じて古いファイルを強制削除
      await loc.unlock(lock_filePath); 
    }
    // 1. ロックを取得 (ファイルが使用中の場合はエラー、またはリトライ設定が可能)
    // retries: リトライ回数と間隔の設定
    release = await loc.lock(lock_filePath, {
      // stale: nnn [ms]
      // ロック作成から nnn[ms] 以上経過していれば、そのロックは「死んでいる」とみなして破棄する
      // デフォルトの stale 設定は 10,000ms（10秒）
      //update: 2000,  // 2秒ごとに生存確認を更新する
      retries: { retries: 5, minTimeout: 100 } });
    // ファイルが存在しない場合は作成、存在する場合は上書き
    await fsp.writeFile(filePath, rec, 'utf-8');
    //console.log('書き込み完了');
  } 
  catch (error){
    console.error('ロック取得失敗またはファイル操作エラー:', error);
    rc_s='エラー:'+error;
  }
  finally {
    // 3. 必ずロックを解除する
    if (release) {
        await release();
    }
  }
  return rc_s;
}

// オブジェクトとしてまとめてエクスポート
export default {
  checkFileExists,
  deleteFile,
  renameFile,
  changePermission,
  encodeHtml,
  decodeHtml,
  ensureFile,
  readTextFile,
  writeTextFile
};

