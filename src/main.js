const LineAPI = require('./api');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
let exec = require('child_process').exec;

const myBot = ['u95f5fcc0013c63589bd45685aeaeda24','u23e72ebff65695439fecceb6651448a0','u8fa4cee517576982d39c479a7c4757a8','u1c6ae136edc72ce0227fc73ac8d61a85'];
var vx = {};var midnornama = "";var pesane = "";var kickhim = "";var waitMsg = "no";

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}


class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            autocancel: 0,
            autokick: 0,
            protection: 0,
        }
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            // console.log(operation);
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            this.textMessage(txt,message)
        }
      
if(operation.type == 15){
let sapa_left = new Message();
sapa_left.to = operation.param1;
sapa_left.text = "Duh itu kenapa left sih, baru aja mau ngajakin tidur bareng :("
this._client.sendMessage(0,sapa_left);
}

if(operation.type == 16){
let sapa_masuk = new Message();
sapa_masuk.to = operation.param1;
sapa_masuk.text = "Halo Semua:)\n\nKetik [ayam:key] untuk melihat keyword"
this._client.sendMessage(0,sapa_masuk);
}

if(operation.type == 17){
let sapa_join = new Message();
sapa_join.to = operation.param1;
sapa_join.text = "Welcome to the group, Jangan Lupa Bahagia :*"
this._client.sendMessage(0,sapa_join);
}
      
           if(operation.type == 19) {
            if(isAdminOrBot(operation.param2))
            {
             let pelakukick = new Message();
             pelakukick.to = operation.param1;
             pelakukick.text = "Good Bye"
             this._client.sendMessage(1, pelakukick);
            }
          else
            {
             let pelakukick = new Message();
             pelakukick.to = operation.param1;
             pelakukick.contentType = 13;
             pelakukick.contentMetadata = { mid: operation.param2 };
             this._client.sendMessage(1, pelakukick);
             }
           }
      
           if(operation.type == 17 && this.stateStatus.protection == 1) {  //ada join
           if(!isAdminOrBot(operation.param2)) {
           this._kickMember(operation.param1,[operation.param2]);
           }
         }

        if(operation.type == 13 && this.stateStatus.protection == 1 && !isAdminOrBot(operation.param2)) { // ada invite, maka cancel&kick
          if(!isAdminOrBot(operation.param3)) {
          this._cancel(operation.param1,[operation.param3]);
          this._kickMember(operation.param1,[operation.param2]);
         }
        }
      
      if(operation.type == 13 && this.stateStatus.autocancel == 1 && !isAdminOrBot(operation.param2)) { // ada invite, maka cancel
          if(!isAdminOrBot(operation.param3)) {
          this._cancel(operation.param1,[operation.param3]);
         }
        }
      
      if(operation.type == 11 && this.stateStatus.protection == 1) { // ada buka qr
        if(!isAdminOrBot(operation.param2)) {
        this._kickMember(operation.param1,[operation.param2]);
        }
       }
                                                      
        if(operation.type == 15) { 
        //Ada Leave
        // op1 = groupnya
        // op2 = yang 'telah' leave
         if(isAdminOrBot(operation.param2)) {
         this._invite(operation.param1,[operation.param2]);
          }
         }

        if(operation.type == 19 && this.stateStatus.autokick == 1) { //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
            if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
                this._invite(operation.param1,[operation.param3]);
            } 

        }
      
      
        if(operation.type == 19) { //admin di kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
            if(isAdminOrBot(operation.param3)) {
              if(!isAdminOrBot (operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
                this._invite(operation.param1,[operation.param3]);
                }
            } 

        }

        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { // diinvite
            if(isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1);                
            } 
        }
        this.getOprationType(operation);
    }
  

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }

 setState(seq,param) {
		if(param == 1){
			let isinya = "Bot status :\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }this._sendMessage(seq,isinya);
		}else{
        if(isAdminOrBot(seq.from)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
			let isinya = "Bot status :\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
			this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`Kamu bukan admin. daftarkan terlebih dahulu ke : line.me/ti/p/~ripan_fauzi`);
        }}
    }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

    async leftGroupByName(payload) {
        let gid = await this._findGroupByName(payload);
        for (var i = 0; i < gid.length; i++) {
            this._leaveGroup(gid[i]);
        }
    }
    
    async check(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }

    async textMessage(textMessages, seq) {
        let [ cmd, ...payload ] = textMessages.split(' ');
        payload = payload.join(' ');
        let txt = textMessages.toLowerCase();
        let messageID = seq.id;
      
        var optreply_cekAdmin=['Kamu bukan admin.','You are not admin','Status lu ya jones']
        var randomNumber2=Math.floor(Math.random()*optreply_cekAdmin.length);
        var reply_cekAdmin=(optreply_cekAdmin[randomNumber2]);
      
        var optreply_halo=['Bubar ada jones','apaan lu jones','bubar ada orang gila']
        var randomNumber3=Math.floor(Math.random()*optreply_halo.length);
        var reply_halo=(optreply_halo[randomNumber3]);
        
			  const cot = textMessages.split('@');
      
        var today = new Date();
			  var jam = ['11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07','08','09','10','11'];
        var curr_hour = jam[today.getHours()];
        var curr_minute = today.getMinutes();
        var curr_second = today.getSeconds();      
        
        var unirest = require('unirest');
        var mime = require('mime');
        
        var request = require('request');
             
        var group = await this._getGroup(seq.to); 
      
var bulanku = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var hariku = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum&#39;at', 'Sabtu'];
var date = new Date();
var tanggal = date.getDate();
var bulan = date.getMonth(),
    bulan = bulanku[bulan];
var hariIni = date.getDay(),
    hariIni = hariku[hariIni];
var tahunku = date.getYear();
var tahun = (tahunku < 1000) ? tahunku + 1900 : tahunku;

if(txt == 'date'){
this._sendMessage(seq, `Pukul ${curr_hour}:${curr_minute}:${curr_second}\n\n${hariIni}, ${tanggal} ${bulan} ${tahun}`);
}
      
         if(group.preventJoinByTicket==false && !isAdminOrBot(seq.from) && this.stateStatus.protection == 1)
         {
         this._sendMessage(seq,'Mau ngapain lu buka QR?');         
         group.preventJoinByTicket=true;
         await this._updateGroup(group);
         }
      
        if(cmd == 'kick' && isAdminOrBot(seq.from)) {
          let target = payload.replace('@','');
          let group = await this._getGroups([seq.to]);
          let gm = group[0].members;
            for(var i = 0; i < gm.length; i++){
                if(gm[i].displayName == target){
                        target = gm[i].mid;
                }
            }
            this._kickMember(seq.to,[target]);
         }
         

    if(txt == 'gcreator') {
    let creator = group.creator.mid;
    seq.contentType=13;
    seq.contentMetadata = { mid: `${creator}` };
    this._client.sendMessage(1, seq);
    }
      
      
   if(txt == 'ginfo') {
    let gname = group.name;
    let gcname = group.creator.displayName;
    let groupid = group.id;
    let gmembers = group.members.length;
    this._sendMessage(seq, `[Nama Group] \n${gname}\n\n[Dibuat oleh]\n${gcname}\n\n[Group ID]\n${groupid}\n\n[Jumlah Member]\n${gmembers}`);  
    }
                        
      if(txt == 'mystatus')
      {
        if(isAdminOrBot(seq.from))
          {
            this._sendMessage(seq,'Kamu Adalah Admin');
          }
         else
           {
             this._sendMessage(seq,reply_cekAdmin);
           }
      }
      
      if(txt == 'halo' || txt == 'hai' || txt == 'hi' || txt == 'hay')
      {
        if(isAdminOrBot(seq.from))
          {
            this._sendMessage(seq,'Eh ada bosQ');
          }
         else
           {
             this._sendMessage(seq,reply_halo);
           }
      }
      
      if(txt == 'botstatus'){
        if(isAdminOrBot(seq.from))
        {
        this._sendMessage(seq,`status: \n${JSON.stringify(this.stateStatus)}`);
        }
        else
         {
          this._sendMessage(seq,`kamu bukan admin. daftarkan terlebih dahulu ke : line.me/ti/p/~ripan_fauzi`);       
         }
      }
	
      
            if(txt == 'gift') {
           	seq.contentType = 9
            seq.contentMetadata = {'PRDID': 'a0768339-c2d3-4189-9653-2909e9bb6f58','PRDTYPE': 'THEME','MSGTPL': '3'};
            this._client.sendMessage(1, seq);
            }
      
           if(txt == 'y' || txt == 'g') {
           seq.contentType = 7
           seq.contentMetadata = {'STKID':'404','STKPKGID':'1','STKVER':'100'};
           this._client.sendMessage(3, seq);
           }

     if(cmd == 'cancel' && isAdminOrBot(seq.from)) {
      if(payload == 'group') {
        let groupid = await this._getGroupsInvited();
        for (let i = 0; i < groupid.length; i++) {
           this._rejectGroupInvitation(groupid[i])                    
            }
            return;
           }
            if(this.stateStatus.autocancel == 1) {
                this.cancelAll(seq.to);
            }
          }
	
        if(txt == 'bcreator' || txt == 'botcreator') {
            let txt = await this._sendMessage(seq, 'Add my creator ⬇');
            seq.contentType=13;
            seq.contentMetadata = { mid: 'u95f5fcc0013c63589bd45685aeaeda24' };
            this._client.sendMessage(1, seq);
            }

	    
	      if(txt == 'ayam:keyword' || txt == 'ayam:help' || txt == 'ayam:key' || txt == '[ayam:key]' ) {
	      this._sendMessage(seq, `Gunakan Bot dengan bijak wahai para penghuni ${group.name}\n\n[Ekonomi]:\n1. botcreator\n2. speed\n3. point\n4. check\n5. reset\n6. myid\n7. test\n8. mystatus\n9. gift\n10. ginfo\n11. gcreator\n12. date\n\n[VIP]:\n1. autokick on/off\n2. autocancel on/off\n3. protection on/off\n4. botstatus\n5. HaYaBuSa (kick all)\n6. cancel (cancel all)\n7. spam Jumlah:Kata\n8. tagall\n9. openQR/closeQR\n10. kick @tag\n11. spm <jumlah>-<NamaGrup>/<mid>\n12. left\n\n[${curr_hour}:${curr_minute}:${curr_second}]`);
	      }      
      
        if(txt == 'speed') {
            const curTime = (Date.now() / 10000);
            await this._sendMessage(seq,'Process....');
            const rtime = (Date.now() / 10000) - curTime;
            await this._sendMessage(seq, `${rtime} detik(s)`);
        }

        if(cmd == 'HaYaBuSa' && this.stateStatus.autokick == 1 && isAdminOrBot(seq.from)) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }

        if(txt == 'point' || txt == 'Point' || txt == 'poin' || txt == 'Poin') {
            this._sendMessage(seq, `Read point telah di set! \n\n[${curr_hour}:${curr_minute}:${curr_second}]`);
            this.removeReaderByGroup(seq.to);
        }

        if(txt == 'reset' || txt == 'Reset') {
            this.checkReader = []
            this._sendMessage(seq, `Read point telah di reset! \n\n[${curr_hour}:${curr_minute}:${curr_second}]`);
        }

	      if(txt == 'tagall' && isAdminOrBot (seq.from)) {
            let rec = await this._getGroup(seq.to);
            const mentions = await this.mention(rec.members);
   	    seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
        }

        if(txt == 'check' || txt == 'Check' || txt == 'cek' || txt == 'Cek'){
            let rec = await this.check(this.checkReader,seq.to);
            const mentions = await this.mention(rec);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
            
        }       
     
         if(seq.contentType = 13 && !isAdminOrBot){
          seq.contentType = 0
          this._sendMessage(seq,`DisplayName : ${seq.contentMetadata.displayName}\n\nMID : ${seq.contentMetadata.mid}`);
          }      
         
	
        const action = ['autocancel on','autocancel off','autokick on','autokick off','protection on','protection off']
        if(action.includes(txt)) {
            this.setState(seq)
        }
	
        if(txt == 'myid') {
            this._sendMessage(seq,`MID kamu: ${seq.from}`);
        }
      
       const joinByUrl = ['openqr','closeqr'];
        if(joinByUrl.includes(txt) && isAdminOrBot(seq.from)) {
            this._sendMessage(seq,`Process ...`);
            let updateGroup = await this._getGroup(seq.to);
            updateGroup.preventJoinByTicket = true;
            if(txt == 'openqr') {
                updateGroup.preventJoinByTicket = false;
                const groupUrl = await this._reissueGroupTicket(seq.to)
                this._sendMessage(seq,`Line group = line://ti/g/${groupUrl}`);
            }
            await this._updateGroup(updateGroup);
        }
      
        if(txt == 'test') {
        this._sendMessage(seq, `Ayam Kampung Aktif !! \n\n[${curr_hour}:${curr_minute}:${curr_second}]`);
        }
      
      
        if(cmd == 'spam' && isAdminOrBot(seq.from)) { //spam <jumlah>:<kata>
        const [ jumlah, kata ] = payload.split(':');
        for(var i= 0; i < jumlah;  i++) 
        {
        this._sendMessage(seq, `${kata}`);
        }
        }
      
       if(cmd == 'Apakah' || cmd == 'apakah') {
              let optreply_jawab=['Ya','Tentu saja iya','Tidak','Tentu saja tidak']
              let random3 = Math.floor(Math.random()*optreply_jawab.length);
              let reply_jawab=(optreply_jawab[random3]);                            
              this._sendMessage(seq, `${reply_jawab}`);
              }
          
      if(cmd == 'Kapan' || cmd == 'kapan' || cmd == 'Sampai kapan' || cmd == 'sampai kapan') {
              let optreply_jawab=['1','2','3','4','5','6','7','8','9','10']
              let random4 = Math.floor(Math.random()*optreply_jawab.length);
              let reply_jawab=(optreply_jawab[random4]);
              let unch="";
                if(reply_jawab > 4){ 
                    unch = "Masih lama."; 
                 } 
                else{ 
                    unch = "Sebentar lagi."; 
                    }                
              this._sendMessage(seq, `Hmm, ${unch} Kira - Kira ${reply_jawab} tahun.`);
           }
      

        if(cmd == 'join' && isAdminOrBot(seq.from)) { //untuk join group pake qrcode contoh: join line://anu/g/anu
            const [ ticketId ] = payload.split('g/').splice(-1);
            let { id } = await this._findGroupByTicket(ticketId);
            await this._acceptGroupInvitationByTicket(id,ticketId);
        }
      
      // if(cmd == ".music" ) {
	      //const songname=payload.replace(':','');
	      //const params={'songname':songname};
	      //const datalirik = request.get(`https://ide.fdlrcn.com/workspace/yumi-apis/joox?`+mime.define(params));
	      //this._sendMessage(seq, `Lirik :\n${JSON.stringify(datalirik)}`);
      // }
      
     // if(txt == ".musik" ) {
	     // const datalirik = request.get('https://ide.fdlrcn.com/workspace/yumi-apis/joox?songname=Bergoyang');
	      //this._sendMessage(seq, `Lirik :\n${JSON.parse(datalirik)}`);
     // }
			      
         //spm <jumlah>-<NamaGrup>/<mid>
         //spm 100-NamaGrupnya/midkorban
        if(cmd == 'spm' && isAdminOrBot(seq.from)) { 
            const [ j, u ] = payload.split('-');
            const [ n, m ] = u.split('/');
            for (var a = 0; a < j; a++) {
                this._createGroup(`${n}`,[m]);
            }
        }
			
			if(vx[1] == "msg" && seq.from == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1" && vx[3] == "mid" && cot[1]){
				let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, btw pesan-nya apa ?"
				this._client.sendMessage(0,bang);
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let midnya = JSON.stringify(pment);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, btw pesan-nya apa ?"
				this._client.sendMessage(0,bang);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && panjang.length > 30){
				this._sendMessage(seq,"OK !, btw pesan-nya apa ?");
				vx[4] = txt;
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "mid"){
				let panjangs = vx[4].split("");
				let kirim = new Message();let bang = new Message();
				bang.to = seq.to;
				if(panjangs[0] == "u"){
					kirim.toType = 0;
				}else if(panjangs[0] == "c"){
					kirim.toType = 2;
				}else if(panjangs[0] == "r"){
					kirim.toType = 1;
				}else{
					kirim.toType = 0;
				}
				bang.text = "Terkirim bang !";
				kirim.to = vx[4];
				kirim.text = txt;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";vx[4] = "";
				this._client.sendMessage(0, kirim);
				this._client.sendMessage(0, bang);
			}else{
				this._sendMessage(seq,"# How to !msg\nTag / Kirim Kontak / Kirim Mid orang yang mau dikirimkan pesan !");
			}
		}if(txt == "msg" && isAdminOrBot(seq.from)) {
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;vx[3] = "mid";
			    this._sendMessage(seq,"Mau kirim pesan ke siapa bang ?");
				this._sendMessage(seq,"Tag / Kirim Kontak / Kirim Mid orang yang mau dikirimkan pesan !");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		} if(txt == "msg" && !isAdminOrBot(seq.from)){
            this._sendMessage(seq,"Mohon Maaf Anda Bukan Admin~");
}
        
        if(txt == 'left' && isAdminOrBot(seq.from)) { //untuk left dari group atau spam group contoh left <alfath>
            let txt = await this._sendMessage(seq,`Bye ${group.name}`);
            this._leaveGroup(seq.to);
        }

    }

}

module.exports = new LINE();
