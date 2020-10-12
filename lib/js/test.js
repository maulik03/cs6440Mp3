//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

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
  function displayPatient(pt) {
    document.getElementById('patient_name').innerHTML = getPatientName(pt);
    document.getElementById('gender').innerHTML = pt.gender;
    document.getElementById('dob').innerHTML = pt.birthDate;
  }
  
  function getMedicationName(medCodings = []) {
      const rxnorm  = "http://www.nlm.nih.gov/research/umls/rxnorm";
      var coding = medCodings.find(c => c.system === rxnorm);
      return coding && coding.display || "Unnamed Medication(TM)";
  }
  
  function getNutritionName(input = []) {
      const foodPref  = "https://fdc.nal.usda.gov/";
      if (input.excludeFoodModifier == null){
        return;
        //var coding = input.excludeFoodModifier.coding.find(c => c.system === foodPref);
        //return coding && coding.display || "Unnamed Nutrition(TM)";
      } else {
        return input.excludeFoodModifier;
      }
      //var coding = input.excludeFoodModifier.coding.find(c => c.system === foodPref);
      //return coding && coding.display || "Unnamed Nutrition(TM)";
  }
  
  //function to display list of medications
  function displayMedication(meds) {
    med_list.innerText = meds instanceof Error ?
          String(meds) :
          JSON.stringify(meds, null, 4).replaceAll('[', '').replaceAll(']', '').replaceAll('",', '').replaceAll('"', '');
  }
  
  //function to display list of nutrition orders
  function displayNutritionOrder(orders) {
     //nutrition_list.innerText = JSON.stringify(orders);
     nutrition_list.innerText = orders instanceof Error ?
          String(orders) :
          JSON.stringify(orders, null, 4).replaceAll('[', '').replaceAll(']', '').replaceAll('",', '').replaceAll('"', '');
     //test = orders.toString(); DOESNT WORK
     test = JSON.stringify(orders);
     String test2 = "" + test;
     nutrition_list2.innerText = test;
     /*if (test instanceOf String) { DOESNT WORK
       nutrition_list4.innerText = "String"
     } else {
       nutrition_list4.innerText = "Not string"
     }*/
     nutrition_list3.innerText = test2.substring(test2.indexOf("text")+4, test2.length());
     nutrition_list4.innerText = test2;
     /*if (orders.resource.text != null){
       nutrition_list3.innerText = "3" && orders.resource.text;
       nutrition_list4.innerText = "4" && orders.text;
     }*/
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
      note: 'No Annotation',
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
  }
  
  //once fhir client is authorized then the following functions can be executed
  FHIR.oauth2.ready().then(function(client) {
  
    // get patient object and then display its demographics info in the banner
    client.request(`Patient/${client.patient.id}`).then(
      function(patient) {
        displayPatient(patient);
        console.log(patient);
      }
    );
  
    // get observation resoruce values
    var query = new URLSearchParams();
  
    query.set("patient", client.patient.id);
    query.set("_count", 100);
    query.set("_sort", "-date");
    query.set("code", [
      'http://loinc.org|8302-2',
      'http://loinc.org|29463-7',
      'http://loinc.org|8462-4',
      'http://loinc.org|8480-6',
      'http://loinc.org|2085-9',
      'http://loinc.org|75305-3',
      'http://loinc.org|55284-4',
      'http://loinc.org|3141-9',
    ].join(","));
  
    client.request("Observation?" + query, {
      pageLimit: 0,
      flat: true
    }).then(
      function(ob) {
  
        // group all of the observation resoruces by type into their own
        var byCodes = client.byCodes(ob, 'code');
        var height = byCodes('8302-2');
        var weight = byCodes('29463-7');
        var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
        var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
        var hdl = byCodes('2085-9');
        var ldl = byCodes('75305-3');
  
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
  
        displayObservation(p)
  
      });
    
    
    
    const getPath = client.getPath;
    client.request(`/MedicationRequest?patient=${client.patient.id}`, {
        resolveReferences: "medicationReference"
    }).then(data => data.entry.map(item => getMedicationName(
        getPath(item, "resource.medicationCodeableConcept.coding") ||
        getPath(item, "resource.medicationReference.code.coding")
    ))).then(displayMedication);
    
    client.request(`/NutritionOrder?patient=${client.patient.id}`, {
        resolveReferences: "nutritionOrder"
    }).then(orders => orders.entry.map(item => getNutritionName(
        getPath(item, "resource")
    ))).then(displayNutritionOrder);
      
      
      //.then(orders => orders.entry.map(displayNutritionOrder));
      
      /*.then(orders => orders.entry.map(item => getNutritionName(
        getPath(item, "resource.excludeFoodModifier.coding")
    ))).then(displayNutritionOrder);*/
    
    //.then(orders => orders.entry.map(displayNutritionOrder));
  
    //update function to take in text input from the app and add the note for the latest weight observation annotation
    //you should include text and the author can be set to anything of your choice. keep in mind that this data will
    // be posted to a public sandbox
    function addWeightAnnotation() {
      var annotation = "test annotation"
      displayAnnotation(annotation);
    }
    
    
  
    //event listner when the add button is clicked to call the function that will add the note to the weight observation
    //document.getElementById('add').addEventListener('click', addWeightAnnotation);
  
  
  }).catch(console.error);