//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

//create a fhir client based on the sandbox enviroment and test paitnet.
const client = new FHIR.client({
    serverUrl: "https://r4.smarthealthit.org",
    tokenResponse: {
      patient: "5214a564-9117-4ffc-a88c-25f90239240b"
      //patient: "a6889c6d-6915-4fac-9d2f-fc6c42b3a82e"
      //patient: "cdf500b9-7cc4-424d-a86c-a18e6620d6e7"
    }
  });
  
  //const rxnorm  = "http://www.nlm.nih.gov/research/umls/rxnorm";
  //const getPath = client.getPath;
  
  var curTime = (new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0]).split('T')[0];
  
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
  
  //function to display list of A1c
  function displayA1c(a1c) {
    a1c_list.innerHTML += "<li> " + a1c + "</li>";
  }
  
  //function to display list of Glucose
  function displayGlucose(glu) {
    glu_list.innerHTML += "<li> " + glu + "</li>";
  }
  
  //function to display list of Body Mass Index
  function displayBMI(bmi) {
    bmi_list.innerHTML += "<li> " + bmi + "</li>";
  }
  
  //function to display list of Blood Pressure
  function displayBP(bp) {
    bp_list.innerHTML += "<li> " + bp + "</li>";
  }
  
  //function to display list of Total Cholesterol
  function displayTC(tc) {
    tc_list.innerHTML += "<li> " + tc + "</li>";
  }
  
  //function to display list of HDL Cholesterol
  function displayHDLC(hdlc) {
    hdlc_list.innerHTML += "<li> " + hdlc + "</li>";
  }
  
  //function to display list of LDL Cholesterol
  function displayLDLC(ldlc) {
    ldlc_list.innerHTML += "<li> " + ldlc + "</li>";
  }
  
  //function to display list of Tobacco smoking status
  function displayTSS(tss) {
    tss_list.innerHTML += "<li> " + tss + "</li>";
  }
  
  //function to display list of medications
  function displayMedication(meds) {
    med_list.innerHTML += "<li> " + meds + "</li>";
  }
  
  //function to display list of goals
  function displayGoal(goal) {
    goal_list.innerHTML += "<li> " + goal + "</li>";
  }
  
  //function to display list of recommendations
  function displayRec(rec) {
    rec_list.innerHTML += "<li> " + rec + "</li>";
  }
  
  function monthDiff(d1, d2) {
      var months;
      d1 = new Date(d1);
      d2 = new Date(d2);
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      return months <= 0 ? 0 : months;
  }
  
  // get patient object and then display its demographics info in the banner
  client.request(`Patient/${client.patient.id}`).then(
    function(patient) {
      displayPatient(patient);
      console.log(patient);
    }
  );
  
  // get Hemoglobin A1c observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|4548-4',   // Hemoglobin A1c/Hemoglobin.total in Blood
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayA1c(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('a1c').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get Glucose observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|2339-0',   // Glucose
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayGlucose(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('glu').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get Body Mass Index observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|39156-5',   // Body Mass Index
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayBMI(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('bmi').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get Blood Pressure observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|55284-4',   // Blood Pressure
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            var comp = resource.component;
            if (comp != undefined) {
              time = time.split('T')[0];
              var dbp = comp[0].valueQuantity.value;
              var sbp = comp[1].valueQuantity.value;
              var unit = comp[1].valueQuantity.unit;
              display = time + " --- " + sbp.toFixed(2) + "/" + dbp.toFixed(2) + unit;
              displayBP(display);
              var diffMonth = monthDiff(time, curTime);
              if (!isRecDone && diffMonth > 6) {
                isRecDone = true;
                var warnMsg = diffMonth + " months elapsed, please get the test done."
                document.getElementById('bp').innerHTML = warnMsg;
              }
            }
          }
        }
      }
    }
  });
  
  // get Total Cholesterol observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|2093-3',   // Total Cholesterol
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayTC(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('tc').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get HDL Cholesterol observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|2085-9',   // HDL Cholesterol
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayHDLC(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('hdlc').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get LDL Cholesterol observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|18262-6',   // LDL Cholesterol
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var quanity = resource.valueQuantity.value;
            var unit = resource.valueQuantity.unit;
            display = time + " --- " + quanity.toFixed(2) + unit;
            displayLDLC(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone && diffMonth > 6) {
              isRecDone = true;
              var warnMsg = diffMonth + " months elapsed, please get the test done."
              document.getElementById('ldlc').innerHTML = warnMsg;
            }
          }
        }
      }
    }
  });
  
  // get Tobacco smoking status observation
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("_count", 3);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|72166-2',   // Tobacco smoking status
  ].join(","));
  client.request("Observation?" + query).then(function(data) {
    if (data.entry != undefined) {
      var isRecDone = false;
      for (var i = 0; i < data.entry.length; i++) {
        var display = "";
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var time = resource.effectiveDateTime;
          if (time != undefined) {
            time = time.split('T')[0];
            var status = resource.valueCodeableConcept.text;
            display = time + " --- " + status;
            displayTSS(display);
            var diffMonth = monthDiff(time, curTime);
            if (!isRecDone) {
              isRecDone = true;
              if (status.toLocaleLowerCase() != "never smoker" && status.toLocaleLowerCase() != "former smoker") {
                var warnMsg = "Please quit tobacco smoking!";
                document.getElementById('tss').innerHTML = warnMsg;
              }
            }
          }
        }
      }
    }
  });
  
  client.request(`MedicationRequest?patient=${client.patient.id}`).then(function(data) {
    if (data.entry != undefined) {
      for (var i = 0; i < data.entry.length; i++) {
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var medReq = resource.medicationCodeableConcept;
          if (medReq != undefined) {
            var medCodeConceptCoding = medReq.coding;
            if (medCodeConceptCoding != undefined) {
              for (var j = 0; j < medCodeConceptCoding.length; j++) {
                var display = medCodeConceptCoding[j].display;
                if (display != undefined) {
                  displayMedication(display);
                }
              }
            }
          }
        }
      }
    }
  });
  
  client.request(`Goal?patient=${client.patient.id}`).then(function(data) {
    if (data.entry != undefined) {
      for (var i = 0; i < data.entry.length; i++) {
        var resource = data.entry[i].resource;
        if (resource != undefined) {
          var description = resource.description;
          if (description != undefined) {
            var text = description.text;
            if (text != undefined) {
              displayGoal(text);
            }
          }
        }
      }
    }
  });
  
  var query = new URLSearchParams();
  query.set("patient", client.patient.id);
  query.set("code", [
    'http://snomed.info/sct|15777000',   // Prediabetes
  ].join(","));
  client.request("Condition?" + query).then(function(data) {
    if (data.entry != undefined) {
      if (data.entry.length >= 1) {
        displayRec("You seem to be Prediabetic as per FHIR record, please get regular check-ups.");
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
      displayRec("You seem to be non-diabetic as per FHIR record!");
    }
  });
  