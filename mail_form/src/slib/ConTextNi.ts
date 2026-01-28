// ConTextNi.ts

import { Hash } from 'crypto';
import comlib from './ComLib';

import * as fs from 'fs';
//import { promises as fs } from 'fs';

import * as readline from 'readline';
import { sprintf } from 'sprintf-js';

import { finished } from 'node:stream/promises';


export default class ConTextNi {
  // フィールドの定義
  //name: string;
  //age: number;

  id_size:number = 3;
  max_count:number = 900;
  file_path:string='../tinfo/sc-005.txt';
  file_path_bak:string='../tinfo/sc-005.txt.bak';

  // コンストラクタ
  constructor(id_size:number, max_count:number, file_path:string) {
      this.id_size = id_size;
      this.max_count = max_count;
      this.file_path=file_path;
      this.file_path_bak=file_path+'.back';
  }

  //---------
  //	コンテントレコードＩＤの取得
  //		注）上位で、ファイルロックしてください
  //	入力パラメータ
  //    obj = { bno: null };
  //      bno : レコードＩＤ  の設定参照  'r001' ～ 'r200'
  //	出力情報
  //		$rc_s : エラーメッセージ
  //
  //  how to call
  // let obj = { bno: null };
  //  xxx.makeID(obj);
  //---------
  async makeID(obj:{bno:string}): Promise<void>{
    //my (%bno_st,$i,$rc_s,$bnox,$s);
    let bnox:string;
    //my ($bno) = @_;
    let rc_s:string='';
    //%bno_st=();
    let bno_st = new Map<string, string>();
    //main::exitError("makeID() : #1 \$file_path=$file_path");
    //ファイルロックを行います
    //lock(LF,$topgen_id_Lock) || exitError("トップページジェネレート情報ファイルをロックできません!!");

    // async関数を定義して即座に呼び出す
    //(async () => {
    //コンテントTextファイルは、有ります
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });

      let recordCount = 0;
      // 'line'イベントで1行ずつ処理
      //  $s=~ m/^(r\d*),.*/;   -- perl
      const regex: RegExp = /^(r\d*),.*/;
      for await (const line of rl) {
        //console.log(`[レコード ${recordCount}] ${line}`);
        // ここで各行のデータを処理する（例: パース、DB保存など）

        //console.log("makeID():#2 line:"+line);

        const match = line.match(regex);
        const s1 = match ? match[1] : null;
        if(s1 != null){
          bno_st.set(s1, s1);
          //console.log("makeID():#2.1 s1:"+s1); // 出力: r123
          //console.log(bno_st);
        }
        //console.log(s1); // 出力: r123
        recordCount++;
      }
      //open (D_FILE,"<$file_path") || return 'ConTextNi::makeID() :#2 コンテントTextファイルがアクセスできません!!';
      //while(<D_FILE>){
      //  $s = $_;
      //  $s=~ m/^(r\d*),.*/;
      //  $bnox=$1;
      //  $bno_st{$bnox}=$bnox;
      //}
      //close (D_FILE);
      rl.close();
      fileStream.close();
    }

    for(let i:number=1; i <= this.max_count;i++){
      // const result = sprintf("%03d: %s", 1, "hoge"); // "001: hoge"
      bnox = 'r'+sprintf("%0"+this.id_size+"d",i);
      //if(!exists $bno_st{$bnox}){
      if(!bno_st.has(bnox)){
        obj.bno = bnox;
        console.log("makeID():#6 obj.bno:"+obj.bno); // 出力: r123
        break;
      }
    }
    //})();
    //return rc_s;
  }

  // メソッド
  //sayHello(): void {
  //    console.log(`こんにちは、私は${this.name}です。${this.age}歳です。`);
  //}

  //---------
  // コンテントレコード,管理レコードの 書きこみ
  //	注）上位で、ファイルロックしてください
  //	入力パラメータ
  //		$bno : レコードＩＤ 'r001' ～ 'r200'  'c01'
  //		$in_rec : 書込みレコード
  //	出力情報
  //		$rc_s :  '' / 'エラーメッセージ' → OK / NG
  //---------
  async write(bno:any, in_rec:string):Promise<string>{
    //my ($gen_rec,$flg,$s,$bnox,@o_list);
    //my ($bno,$in_rec) = @_;
    let flg:number=0;
    //@o_list=();
    let o_list: string[]=[];
    //$gen_rec=$bno.','.$in_rec;

    const gen_rec:string=bno+','+in_rec;

    let bnox:string='';
    //レコードＩＤがヌルです
    if(typeof bno !== 'string' || bno === ''){
      return 'ConTextNi::write() : #1 レコードＩＤの指定がありません!!';
    }

    //コンテントTextファイルは、有ります
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });

      //  $s=~ m/^(r\d*),.*/;   -- perl
      //  $s=~ m/^([rc]\d*),.*/; -- perl
      const regex: RegExp = /^([rc]\d*),.*/;

      for await (const line of rl) {
        //console.log(`[レコード ${recordCount}] ${line}`);
        // ここで各行のデータを処理する（例: パース、DB保存など）

        const match = line.match(regex);
        const s1 = match ? match[1] : null;
        if(s1 != null){
          bnox=s1;
          if(bno === bnox){
            o_list.push(gen_rec);
            flg=1;
          }
          else{
            o_list.push(line);
          }
        }
        else{
            o_list.push(line);
        }
        //console.log(s1); // 出力: r123
        //recordCount++;
      }

      //open (D_FILE,"<$file_path") || return 'ConTextNi::write() :#2 コンテントTextファイルがアクセスできません!!';
      //while(<D_FILE>){
      //  $s = $_;
      //  $s=~ m/^([rc]\d*),.*/;
      //  $bnox=$1;
      //  if($bno eq $bnox){
      //    push(@o_list,$gen_rec);
      //    $flg=1;
      //  }
      //  else{
      //    push(@o_list,$s);
      //  }
      //}
      //close (D_FILE);
      rl.close();
      fileStream.close();
    }
    //#該当レコードは、未処理です
    if(flg===0){
      //push(@o_list,$gen_rec);
      o_list.push(gen_rec);
    }

    // 書き込み用のストリームを作成
    const writer = fs.createWriteStream(this.file_path_bak, {
      flags: 'w', // 'w'は上書き、'a'なら追記
      encoding: 'utf8'
    });

    //open (D_FILE,">$file_path_bak") || return 'ConTextNi::write() :#3 コンテントTextファイルがアクセスできません!!';
    //foreach $s (@o_list){
    //  chomp($s);
    //  print D_FILE $s,"\n";
    //}
    //close (D_FILE);

    for (const record of o_list) {
      // 1行書き込み（改行コード \n を手動で付与）
      const success = writer.write(`${record}\n`);
      if (!success) {
        // 書き込みバッファがいっぱいの場合、'drain'イベントを待つ（大量データ時のメモリ保護）
        await new Promise((resolve) => writer.once('drain', resolve));
      }
    }

    // 書き込み終了
    writer.end();
    
    // 完全に閉じられるまで待機する場合
    //return new Promise((resolve, reject) => {
    //  writer.on('finish', resolve);
    //  writer.on('error', reject);
    //});

    await finished(writer); // これだけで完了待機ができる
    await writer.close();

    //#ファイルを正式にします
    if(fs.existsSync(this.file_path)==true){
      //unlink $file_path;
      await comlib.deleteFile(this.file_path);
    }
    //rename $file_path_bak,$file_path;
    await comlib.renameFile(this.file_path_bak, this.file_path);

    //chmod 0666,$file_path;
    let octalNumber: number = 0o666; // 0oプレフィックスを使用
    await comlib.changePermission(this.file_path,octalNumber);

    return '';
  }

  //---------
  // コンテントレコードの 指定位置への挿入
  //	入力パラメータ：
  //		$bno : レコードＩＤ 'r001' ～ 'r22'
  //		$pos :  インサート位置   0 ～
  //		$in_rec : 書込みレコード
  //	出力情報
  //		$rc_s :  '' / 'エラーメッセージ' → OK / NG
  //---------
  //sub insert($$$){
  async insert(bno:any, pos:Number, in_rec:Record<string, any>):Promise<string>{
    let rc_s:string="";
    //my ($bnox,$gen_rec);
    //my (%rec,$s,@o_list);
    //my ($bno,$pos,$in_rec) = @_;

    //#レコードＩＤがヌルです
    if(typeof bno != 'string' || bno == null){
      return 'ConTextNi::insert() : #1 レコードＩＤの指定がありません!!';
    }
    //const regex: RegExp = /^[rc]\d{this.id_size}$/;
    const regex: RegExp = /^[rc]\d{3}$/;
    if(!regex.test(bno)){
      return 'ConTextNi::insert() : #2 レコードＩＤが、正しくありません!!';
    }
    let flg:number = 0;
    let posx:number = 0;
    let bnox:string='';

    //@o_list=();
    let o_list: string[]=[];
    //$gen_rec=$bno.','.$in_rec;
    // in_rec ハッシュを、string に展開します。
    let gen_rec:string=bno;
    for (const key in in_rec) {
      //console.log("ConTextNi::insert() : #3 key:",key);
      //console.log("ConTextNi::insert() : #4 in_rec[key]:",in_rec[key]);
      if(gen_rec==''){
        gen_rec=key+'='+in_rec[key];
      }
      else{
        gen_rec +=(','+key+'='+in_rec[key]);
      }
    }

    //console.log('ConTextNi::insert() : #4 bno:',bno);
    //console.log("ConTextNi::insert() : #5 gen_rec:",gen_rec);

    // コンテントTextファイルは、有ります
    //if(-e $file_path){
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });
      //open (D_FILE,"<$file_path") || return 'ConTextNi::insert() :#2 コンテントTextファイルがアクセスできません!!';

      // 'line'イベントで1行ずつ処理
      //  $s=~ m/^(r\d*),.*/;   -- perl
      //  $s=~ m/^([rc]\d*),.*/; -- perl
      const regex: RegExp = /^(r\d*),.*/;

      //while(<D_FILE>){
      for await (const line of rl) {
        //$s = $_;
        //$s=~ m/^(r\d*),.*/;
        //$bnox=$1;
        const match = line.match(regex);
        const s1 = match ? match[1] : null;
        // コンテンツレコードです   --> rxxx
        if(s1 != null){
          bnox=s1;
          //指定位置です
          if(pos == posx){
            o_list.push(gen_rec);
            flg=1;
            posx++;
            // 同一レコードＩＤでは、有りません
            if(bno != bnox){
              o_list.push(line);
              posx++;
            }
          }
          //同一レコードＩＤでは、有りません
          else if(bno != bnox){
            o_list.push(line);
            posx++;
          }
        }
        //管理レコードです
        else{
          o_list.push(line);
        }
      }
      rl.close();
      fileStream.close();
    }

    //該当レコードは、未処理です
    if(flg==0){
      //push(@o_list,$gen_rec);
      o_list.push(gen_rec);
    }

    //open (D_FILE,">$file_path_bak") || return 'ConTextNi::insert() :#3 コンテントTextファイルがアクセスできません!!';
    // 書き込み用のストリームを作成
    const writer = fs.createWriteStream(this.file_path_bak, {
      flags: 'w', // 'w'は上書き、'a'なら追記
      encoding: 'utf8'
    });

    //foreach $s (@o_list){
    //  chomp($s);
    //  print D_FILE $s,"\n";
    //}
    //close (D_FILE);

    for (const record of o_list) {
      // 1行書き込み（改行コード \n を手動で付与）
      const success = writer.write(`${record}\n`);
      if (!success) {
        // 書き込みバッファがいっぱいの場合、'drain'イベントを待つ（大量データ時のメモリ保護）
        await new Promise((resolve) => writer.once('drain', resolve));
      }
    }
    // 書き込み終了
    writer.end();
    await finished(writer); // これだけで完了待機ができる
    await writer.close();

    //#ファイルを正式にします
    if(fs.existsSync(this.file_path)==true){
      //unlink $file_path;
      await comlib.deleteFile(this.file_path);
    }
    //rename $file_path_bak,$file_path;
    await comlib.renameFile(this.file_path_bak, this.file_path);

    //chmod 0666,$file_path;
    let octalNumber: number = 0o666; // 0oプレフィックスを使用
    await comlib.changePermission(this.file_path,octalNumber);
    return rc_s;
  }

  //---------
  // コンテントレコード,管理レコードの 削除
  //	注）上位で、ファイルロックしてください
  //	入力パラメータ
  //		$bno : レコードＩＤ 'r001' ～ 'r200'  'c01'
  //	出力情報
  //		$rc_s :  '' / 'エラーメッセージ' → OK / NG
  //---------
  async delete(bno:any):Promise<string>{
    let rc_s:string="";
    //my ($s,$bnox,@o_list);
    //my ($bno) = @_;
    //@o_list=();
    let o_list: string[]=[];

    let bnox:string='';

    //console.log("ConTextNi::delete(): #0 bno="+bno);

    //#レコードＩＤがヌルです
    //if($bno eq ''){
    //	return 'ConTextNi::delete() : #1 レコードＩＤの指定がありません!!';
    //}
    //レコードＩＤがヌルです
    if(typeof bno !== 'string' || bno === ''){
      return 'ConTextNi::delete() : #1 レコードＩＤの指定がありません!!';
    }

    //コンテントTextファイルは、有ります
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });

      //  $s=~ m/^(r\d*),.*/;   -- perl
      //  $s=~ m/^([rc]\d*),.*/; -- perl
      const regex: RegExp = /^([rc]\d*),.*/;

      for await (const line of rl) {
        //console.log(`[レコード ${recordCount}] ${line}`);
        // ここで各行のデータを処理する（例: パース、DB保存など）

        const match = line.match(regex);
        const s1 = match ? match[1] : null;
        if(s1 != null){
          bnox=s1;
          if(bno !== bnox){
            o_list.push(line);
          }
        }
        else{
            o_list.push(line);
        }
        //console.log(s1); // 出力: r123
        //recordCount++;
      }
      rl.close();
      fileStream.close();
    }

    // 書き込み用のストリームを作成
    const writer = fs.createWriteStream(this.file_path_bak, {
      flags: 'w', // 'w'は上書き、'a'なら追記
      encoding: 'utf8'
    });

    for (const record of o_list) {
      // 1行書き込み（改行コード \n を手動で付与）
      const success = writer.write(`${record}\n`);
      
      if (!success) {
        // 書き込みバッファがいっぱいの場合、'drain'イベントを待つ（大量データ時のメモリ保護）
        await new Promise((resolve) => writer.once('drain', resolve));
      }
    }
    // 書き込み終了
    writer.end();

    await finished(writer); // これだけで完了待機ができる
    await writer.close();

    //#ファイルを正式にします
    if(fs.existsSync(this.file_path)==true){
      //unlink $file_path;
      await comlib.deleteFile(this.file_path);
    }
    //rename $file_path_bak,$file_path;
    await comlib.renameFile(this.file_path_bak, this.file_path);

    //chmod 0666,$file_path;
    let octalNumber: number = 0o666; // 0oプレフィックスを使用
    await comlib.changePermission(this.file_path,octalNumber);    
    return rc_s;
  }

  //---------
  //  レコードの読み込み
  //   入力パラメータ
  //		$bno : レコードＩＤ  'c01','rnnn'
  //    //obj = { rec: string };
  //    obj = { rec: Record<string, any>}
  //   出力情報
  //     obj.o_rec
  //---------
  async read(bno:any ,obj:{rec:Record<string, any>},decode:boolean=true):Promise<string>{
    //my ($o_rec,$bnox,$s);
    let bnox:string;
    //my ($bno) = @_;
    let rc_s='';
    let o_rec:string='';
    //#レコードＩＤがヌルです
    if(typeof bno !== 'string' || bno === ''){
      return 'ConTextNi::read() : #1 レコードＩＤの指定がありません!!';
    }
    //コンテントTextファイルは、有ります
    //if(-e $file_path){
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });

      //  open (D_FILE,"<$file_path") || return '';
      //  while(<D_FILE>){
      //    $s = $_;
      //    $s=~ m/^([rc]\d*),(.*)/;
      //    $bnox=$1;
      //    if($bno eq $bnox){
      //      $o_rec = $2;
      //      last;}}

      //  $s=~ m/^(r\d*),.*/;   -- perl
      //  $s=~ m/^([rc]\d*),.*/; -- perl
      //const regex: RegExp = /^([rc]\d*),.*/;
      //const regex: RegExp = /^([rc]\d*),(.*)/;
      const regex: RegExp = /^([rc]\d+),(.*)/;

      for await (const line of rl) {
        //console.log(`[レコード ${recordCount}] ${line}`);
        // ここで各行のデータを処理する（例: パース、DB保存など）

        const match = line.match(regex);
        //const s0 = match ? match[0] : null;
        const s1 = match ? match[1] : null;
        const s2 = match ? match[2] : null;
        if(s1 != null){
          bnox=s1;
          if(bno === bnox){
            // 先頭の rxxx, cxx を取らないといけない
            //console.log("ConTextNi.read() #5 line:"+line);
            //console.log(" s2:"+s2);
            //const result = line.replace(/^r\d+/, "");
            //obj.rec[]=s2;
            const row: Record<string, any> = {};
            // ',' セパレートして、フィールド名: value のハッシュ型にする。
            if (s2 != null && s2 != undefined){
              const rec = s2.split(',');
              rec.forEach((fs, index) => {
                //console.log(`インデックス ${index}: ${fs}`);
                // '=' セパレートして、フィールド名: value の ハッシュ型にする。
                const cols = fs.split('=');
                if(cols[0] != undefined){
                  //フィールド名をキーとした、ハッシュレコード
                  //注) cols[1] の ',' '=' など、退避したコードを元に戻す処理が、必要!! --> value="xxxx" のように
                  // "" で囲めば、必要ないみたい。しかし  フィールドに出す場合は、元にもどす。
                  if(cols[1] === undefined){
                    row[cols[0]]= "";   // "id":"r001" や "name":"xxxx" のハッシュになる。
                  }
                  else{
                    if(decode){
                        row[cols[0]]= comlib.decodeHtml(cols[1]);   // "id":"r001" や "name":"xxxx" のハッシュになる。
                    }
                    else{
                        row[cols[0]]= cols[1];   // "id":"r001" や "name":"xxxx" のハッシュになる。
                    }
                  }
                }
              });
              obj.rec=row;
            }
            break;
          }
        }
      }
      rl.close();
      fileStream.close();
      //  close (D_FILE);}
    }
    return rc_s;
  }
  //---------
  // 全コンテントレコードの読み込み
  //	'rxxx,・・・・'
  //  入力パラメータ
  //	decode:boolean   true -> html デコードする。 false -> html デコードしない
  //  set_pos:boolean  true -> レコードの位置を pos=nnn にセットする
  //  戻り情報
  //	 rows: Record<string, any>[]
  //  注) sqlite3 の 
  //   const sql = 'SELECT * FROM cats';
  //   db.all(sql, [], (err, rows) => {... }
  //     で得られる、 rows のデータ形式に似せてあります。
  //---------
  async getAll_list(decode:boolean=true,set_pos:boolean=true): Promise<Record<string, any>[]> {
    const rows: Record<string, any>[] = [];
    let pos:number=0;
    // コンテントTextファイルは、有ります
    if(fs.existsSync(this.file_path)==true){
      const fileStream = fs.createReadStream(this.file_path); // ファイルをストリームとして開く
      const rl = readline.createInterface({
        input: fileStream, // 読み込むストリームを指定
        crlfDelay: Infinity // CRLF (Windows形式)の改行コードも正しく処理
      });
      const regex: RegExp = /^([rc]\d+),(.*)/;
      for await (const line of rl) {
        //console.log(`[レコード ${recordCount}] ${line}`);
        // ここで各行のデータを処理する（例: パース、DB保存など）
        const match = line.match(regex);
        const s1 = match ? match[1] : null;
        const s2 = match ? match[2] : null;
        if(s1 != null){
          const row: Record<string, any> = {};
          // ',' セパレートして、フィールド名: value のハッシュ型にする。
          if (s2 != null && s2 != undefined){
            const rec = s2.split(',');
            rec.forEach((fs, index) => {
              //console.log(`インデックス ${index}: ${fs}`);
              // '=' セパレートして、フィールド名: value の ハッシュ型にする。
              const cols = fs.split('=');
              if(cols[0] != undefined){
                //フィールド名をキーとした、ハッシュレコード
                //注) cols[1] の ',' '=' など、退避したコードを元に戻す処理が、必要!! --> value="xxxx" のように
                // "" で囲めば、必要ないみたい。しかし  フィールドに出す場合は、元にもどす。
                if(cols[1] === undefined){
                  row[cols[0]]= "";   // "id":"r001" や "name":"xxxx" のハッシュになる。
                }
                else{
                  if(decode){
                      row[cols[0]]= comlib.decodeHtml(cols[1]);   // "id":"r001" や "name":"xxxx" のハッシュになる。
                  }
                  else{
                      row[cols[0]]= cols[1];   // "id":"r001" や "name":"xxxx" のハッシュになる。
                  }
                }
              }
            });
            // コンテンツレコードです
            if(set_pos== true && s1.startsWith("r")==true){
              row["pos"]= pos;   // "id":"r001" や "name":"xxxx" のハッシュになる。
            }
            rows.push(row);
          }
          // コンテンツレコードです!!
          if(s1.startsWith("r")){
            pos++;
          }
        }
      }
      rl.close();
      fileStream.close();
    }
    return rows;
  }

}
