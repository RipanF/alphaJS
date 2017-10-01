const LineConnect = require('./connect');
let LINE = require('./main.js');

const auth = {
	authToken: 'ElZTNG4dS1WIvYHpP9u8.J6to5rDxAyltNeEAFeDxQa.4iXOfecTrrlz/0ITaoY1lJldcOBjgJ2k3QFz80t1S1g=',
	certificate: '',
}
// let client =  new LineConnect(auth);
let client =  new LineConnect();

client.startx().then(async (res) => {
	
	while(true) {
		try {
			ops = await client.fetchOps(res.operation.revision);
		} catch(error) {
			console.log('error',error)
		}
		for (let op in ops) {
			if(ops[op].revision.toString() != -1){
				res.operation.revision = ops[op].revision;
				LINE.poll(ops[op])
			}
		}
	}
});
