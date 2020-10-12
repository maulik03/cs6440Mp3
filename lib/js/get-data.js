//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

// helper function to process fhir resource to get the patient name.
//function to display list of Patient conditions
function displayCon(con_lst) {
  con_list.innerHTML += "<li> " + con_lst + "</li>";
}
//function to display list of patients visits
function getVisits(visits) {
  pat_list.innerHTML += "<li> " + visits + "</li>";
}
//function to display list of goals
function getGoals(goal) {
  goals.innerHTML += "<li> " + goal + "</li>";
}
//function to display list of notes
function getmoreInfo(notes) {
  notes_list.innerHTML += "<li> " + notes + "</li>";
}

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
var phoneNumber = "";
var address ="";
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
  document.getElementById('phone').innerHTML = pt.telecom[0].value;
  //address = (pt.address[0].line[0],pt.address[0].city,pt.address[0].state,pt.address[0].postalCode);
  //console.log(pt.telecom[0].value);
  phoneNumber = pt.telecom[0].value;
  //console.log(pt.address[0].line[0],",",pt.address[0].city,",",pt.address[0].state,",",pt.address[0].postalCode);
}
//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return getQuantityValueAndUnit(formattedBPObservations[0]);
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: ''
    },
    weight: {
      value: ''
    },
    sys: {
      value: ''
    },
    dia: {
      value: ''
    },
    ldl: {
      value: ''
    },
    hdl: {
      value: ''
    },
    glucose: {
      value: ''
    },
    bmi: {
      value: ''
    },
  };
}

//helper function to display the annotation on the index page
function displayAnnotation(annotation) {
  note.innerHTML = annotation;
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  height.innerHTML = obs.height;
  weight.innerHTML = obs.weight;
  glucose.innerHTML = obs.glucose;
  bmi.innerHTML = obs.bmi;
}

// get patient object and then display its demographics info in the banner
client.request(`Patient/${client.patient.id}`).then(
  function(patient) {
    displayPatient(patient);
    console.log(patient);
  }
);
//trying to get condition
//console.log(client.patient.request("Condition"));

//
//console.log("teest");

client.patient.request("Condition").then(
  function(Condition)
  {
    console.log(Condition.entry);
    if(Condition.entry != undefined)
    {
      for (var i = 0; i < Condition.entry.length; i++) {
        var display = "";
        var resoruce = Condition.entry[i].resource;
        //console.log(resoruce);
        if(resoruce != undefined){
          var con_name = resoruce.code.text;
          var con_status = resoruce.clinicalStatus.coding[0].code;

          console.log(con_status + " => "+ con_name);
          var time = resoruce.onsetDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
          display = time+ ":"+con_status + " => "+ con_name ;
          displayCon(display);
          }
        }
      }

    }
  }
)

// getting encounter dates for patients
//console.log(client.patient.request("Encounter"));
client.patient.request("Encounter").then(
  function(Encounter)
  {
    //console.log(Encounter.entry);
      if (Encounter.entry != undefined) {
        var encounter_list = [];
        var res_1 = "";

        for (var i = 0; i < Encounter.entry.length; i++) {
          var display = "";
          var resource = Encounter.entry[i].resource;
          if (resource != undefined) {
            var time = resource.period.end;
            if (time != undefined) {
              time = time.split('T')[0];
              display = time
              encounter_list.push(display);
              var isDescending = true; //set to false for ascending
              encounter_list.sort((a,b) => isDescending ? new Date(b).getTime() - new Date(a).getTime() : new Date(a).getTime() - new Date(b).getTime());
              var final_lst = encounter_list.slice(0, 5);
              var res =final_lst.toString();
              res_1 = res.split(","); 
            
            }
          
          }
      }
      res_1.forEach(getVisits);
      
      //console.log(encounter_list);
      //console.log(final_lst);
      //console.log(res.split(","));
      //console.log(encounter_list.sort); 
    } 
  }
)
//goal function
client.request(`Goal?patient=${client.patient.id}`).then
(function(data) {
  if (data.entry != undefined) {
    for (var i = 0; i < data.entry.length; i++) {
      var resource = data.entry[i].resource;
      if (resource != undefined) {
        var description = resource.description;
        if (description != undefined) {
          var notes = description.text;
          if (notes != undefined) {
            getGoals(notes);
          }
        }
      }
    }
  }
});

var query = new URLSearchParams();
query.set("patient", client.patient.id);
query.set("code", [
  'http://snomed.info/sct|44054006',   // Diabetes
].join(","));
client.request("Condition?" + query).then(function(data) {
  if (data.entry == undefined) {
    getmoreInfo("This patient seems to be non-diabetic as per FHIR record!");
  }
});

//send message function
  function sendMessage() {
    console.log("test-sendSMS");
    var x_msg = document.getElementById("msg").value;
    console.log(x_msg);
    console.log(phoneNumber);
    var upd_number = phoneNumber.replace(/[,.-]/g , ''); 
    console.log(upd_number);

  confirm("SMS Sent to " + upd_number);

  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://d7sms.p.rapidapi.com/secure/send",
  "method": "POST",
  "headers": {
  "authorization": "Basic a3dxcTY1NzQ6SXZsTWQxNDU=",
  "x-rapidapi-host": "d7sms.p.rapidapi.com",
  "x-rapidapi-key": "e964b3079fmshb936ba9b5fcd08ap1137b6jsn06ad71cce7d0",
  "content-type": "application/json",
  "accept": "application/json"
  },
  "processData": false,
  "data": "{ \"content\": \""+x_msg+"\", \"from\": \"D7-Rapid\", \"to\": "+upd_number+"}"
  }

$.ajax(settings).done(function (response) {
console.log(response);
});

}


// get observation resoruce values
// you will need to update the below to retrive the weight and height values
var query = new URLSearchParams();

query.set("patient", client.patient.id);
query.set("_count", 100);
query.set("_sort", "-date");
query.set("code", [
  'http://loinc.org|8462-4',
  'http://loinc.org|8480-6',
  'http://loinc.org|2085-9',
  'http://loinc.org|2089-1',
  'http://loinc.org|55284-4',
  'http://loinc.org|3141-9',
  'http://loinc.org|8302-2', 
  'http://loinc.org|29463-7',
  'http://loinc.org|2339-0',
  'http://loinc.org|39156-5',
].join(","));

client.request("Observation?" + query, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {

    // group all of the observation resoruces by type into their own
    var byCodes = client.byCodes(ob, 'code');
    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
    var hdl = byCodes('2085-9');
    var ldl = byCodes('2089-1');
    var height = byCodes('8302-2');
    var weight = byCodes('29463-7');
    var glucose =byCodes('2339-0');
    var bmi = byCodes('39156-5');

    // create patient object
    var p = defaultPatient();

    // set patient value parameters to the data pulled from the observation resoruce
    if (typeof systolicbp != 'undefined') {
      p.sys = systolicbp;
    } else {
      p.sys = 'undefined'
    }

    if (typeof diastolicbp != 'undefined') {
      p.dia = diastolicbp;
    } else {
      p.dia = 'undefined'
    }

    p.hdl = getQuantityValueAndUnit(hdl[0]);
    p.ldl = getQuantityValueAndUnit(ldl[0]);
    p.height = getQuantityValueAndUnit(height[0]);
    p.weight = getQuantityValueAndUnit(weight[0]);
    p.glucose = getQuantityValueAndUnit(glucose[0]);
    p.bmi=getQuantityValueAndUnit(bmi[0]);


    displayObservation(p)

  });
function getTime()
	{
	  var timezone = -new Date().getTimezoneOffset();
	  var dif = timezone >= 0 ? '+' : '-';
	  var pad = function(num) {
		var norm = Math.abs(Math.floor(num)); 
	      return (norm < 10 ? '0' : '') + norm;
	  };
	 return new Date().getFullYear() 
		+ '-' + pad(new Date().getMonth()+1)
		+ '-' + pad(new Date().getDate())
		+ 'T' + pad(new Date().getHours())
		+ ':' + pad(new Date().getMinutes()) 
		+ ':' + pad(new Date().getSeconds())
		+ dif + pad(timezone / 60) 
		+ ':' + pad(timezone % 60);
	}

//event listner when the add button is clicked to call the function that will add the note to the weight observation
document.getElementById('message').addEventListener('click', sendMessage);