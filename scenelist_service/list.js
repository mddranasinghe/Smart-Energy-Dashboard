const fs = require('fs-extra');
const mqtt = require('mqtt'); 

const top = 'node/em3/jason';
var public_topic="node/em3/list";

// MQTT Broker details

const mqttBroker = 'ws://home.onesmartapi.com:1884/mqtt'; 
const userName = 'dinuka';
const password = 'dinuka';

const mqttOptions = {
  clientId: `mqtt_${Math.floor(Math.random() * 1000)}`,
  username: userName,
  password: password,

};
//var tasks = [], task;


const client = mqtt.connect(mqttBroker, mqttOptions);

client.on('connect', () => {
  console.log("Connected to MQTT Broker");
  getList();
 // getList();
  client.subscribe(top, (err) => {
    if (err) {
      console.error("Subscription error:", err);
    } else {
      console.log("Subscribed to topic 'node/em3/jason");
    }
  });
});

client.on('message', (topic, message) => {
try{
    topic = topic;
    payload=message;
    payload = JSON.parse(payload);
    console.log("Payload:" + payload);
    console.log("Topic:", topic);
   // topicsArray = topic.split("/");
   // jobid=topicsArray[4];
   //
   if(payload == '1'){

    console.log('ok')
    getList();
  
  }

  } catch (error) {
    console.error("Message handling error:", error);
  }

});

client.on('error', (err) => {
  console.error(`Connection error: ${err}`);
});

client.on('close', () => {
  console.log('MQTT connection closed');
});

client.on('reconnect', () => {
  console.log('MQTT client reconnecting');
});

client.on('offline', () => {
  console.log('MQTT client is offline');
});

function sendCommandToDevice(topic, payload) {
  if (client.connected) {
    console.log(`sendCommandToDevice: ${topic}, Payload: ${payload}`);
    client.publish(topic, payload);
  }
}


let jason = loadjason();

// getList();

function loadjason() {
  try {
    const data = fs.readFileSync('list.json', 'utf8');
    const parsedjason = JSON.parse(data);

    if (typeof global.currentTasks !== 'undefined') {
      global.currentTasks.forEach(task => task.stop());
    }
    global.currentTasks = [];

    global.jason = parsedjason;

    return parsedjason;
  } catch (error) {
    console.error('Error reading jason file:', error);
    return [];
  }
}

console.log(JSON.stringify(jason, null, 2));

function getList() {
  const jobList = jason.map(energy => {
    // Generate a random value for curr_sum between 10 and 50
    const randomCurrSum = Math.random() * (50 - 10) + 10;
    const randomCurrSum2 = Math.random() * (200 - 10) + 10;

    const randomCurrSum3 = Math.random() * (6000- 100) + 10;
    const randomCurr = energy.curr.map(() => Math.random() * (50 - 10) + 10);
    return {
      ts: energy.ts,
      id: energy.id,
      volt: energy.volt,
      curr: randomCurr,
      curr_sum: [randomCurrSum], // Update the curr_sum value dynamically
      pow: energy.pow,
      pow_tot: [randomCurrSum3],
      v_am: energy.v_am,
      v_am_tot: energy.v_am_tot,
      v_am_re: energy.v_am_re,
      v_am_re_tot: energy.v_am_re_tot,
      pf: energy.pf,
      pf_tot: energy.pf_tot,
      pa: energy.pa,
      pa_tot: energy.pa_tot,
      volt_avg: [randomCurrSum2],
      curr_avg: energy.curr_avg,
      freq: energy.freq,
      im_ac_en: energy.im_ac_en,
      ex_ac_en: energy.ex_ac_en,
      im_re_en: energy.im_re_en,
      ex_re_en: energy.ex_re_en,
      tot_sys_pow_dem: energy.tot_sys_pow_dem,
      max_tot_sys_pow: energy.max_tot_sys_pow,
      n_curr_dem: energy.n_curr_dem,
      max_n_curr_dem: energy.max_n_curr_dem,
      n_curr: energy.n_curr,
      max_phs_curr_dem: energy.max_phs_curr_dem
    };
  });

  // Send the updated list with the new curr_sum values
  sendCommandToDevice(public_topic, JSON.stringify(jobList));
}

// Run the getList function every 10 seconds to generate and send new curr_sum values
setInterval(function () { getList(); }, 5000);


/*

,
    {
        "ts": [253961],
        "id": [2],
        "volt": [229.92],
        "curr": [4.42],
        "pow": [474.44],
        "ac_ap": [995.44],
        "re_ap": [-198.62],
        "pow_fac": [0.98],
        "phs_ang": [-8.46],
        "ferq": [50.20],
        "im_ac_en": [102039.90],
        "ex_ac_en": [54.14],
        "tot_ac_en": [102094.04],
        "im_re_en": [6033.00],
        "ex_re_en": [11615.90],
        "tot_re_en": [17648.90]
    }
*/