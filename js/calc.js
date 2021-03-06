/****************************
 * Programmer: Yuval Lando  *
 ****************************/

//Maximum number of undo.
var MAX_UNDOS=50;

//Contain the states for undo and redo.
var undoArr=[];
var redoArr=[];

//Find the position of element e on array arr.
var getIndexOnArray=function(arr,e) {
  for (var i=0;i<arr.length;i++) {
    if (arr[i]===e) return i;
  }
}

//Check if two arrays are equal.
var arraysEqual=function(arr1,arr2) {
  if(arr1.length !== arr2.length)
    return false;
  for(var i = arr1.length; i--;) {
    if(arr1[i] !== arr2[i])
      return false;
  }
  return true;
}

//Forms are store on an array named calc.
//This function get a element e and find the index on calc
//of it's form. 
var getFormNum=function(e) {
  return getIndexOnArray(document["calc"],e.form);
}

//Apply binary operation fun on selected pairs for the form of the button e.
var applyOp=function(e,fun) {
  var change=false;
  var formNum=getFormNum(e);
  var form=e.form;
  var state=getState(form);
  form.selectAll.checked=false;
  var LastVal;
  var hasLastVal;
  var result=[];
  
  var firstElement=form.num[0].value;
  var parseFirstElement=parseFloat(firstElement);
  if (!isNaN(parseFirstElement)) {
    hasLastVal=true;
    lastVal=parseFirstElement;
  } else {
    hasLastVal=false;
    result.push(firstElement);
  }
  
  var i;
  
  for (i=0;i<form.doAction.length;i++) {
    var check=form.doAction[i];
    var x=form.num[i].value;
    var y=form.num[i+1].value;
    var z=NaN;
    if (check.checked) {
      check.checked=false;
      if (hasLastVal) {
        z=fun(lastVal,parseFloat(y));
      } else {
        z=fun(parseFloat(x),parseFloat(y));
      }
    }
    if (!isNaN(z)) {
      if (!hasLastVal) {
        hasLastVal=true;
        result.pop();
      }
      lastVal=z;
      change=true;
    } else {
      if (hasLastVal) {
      hasLastVal=false;
      result.push(lastVal);
      } 
      result.push(y);
    }
  }
  if (hasLastVal) {
    result.push(lastVal);
  }
  
  var diff=form.num.length-result.length;
  for (i=0;i<diff;i++) {
    form.num[i].value="";
  }
  var j;
  for (i=0,j=diff;i<result.length;i++,j++) {
    form.num[j].value=result[i];
  }

  if (change) saveState(formNum,state);
}

//Swap elements of selected pairs for the form of the button e.
var swapf=function(e) {
  var change=false;
  var formNum=getFormNum(e);
  var form=e.form;
  var state=getState(form);
  form.selectAll.checked=false;
  for (var i=0;i<form.doAction.length;i++) {
    var check=form.doAction[i];
    if (check.checked) {
      check.checked=false;
      var x=form.num[i];
      var y=form.num[i+1];
      if (x.value!==y.value) {
        var z=x.value;
        x.value=y.value;
        y.value=z;
        change=true;
      }
    }
  }
  if (change) saveState(formNum,state);
}

//Uncheck all the selected pairs of the form.
var unCheckAll=function(form) {
  form.selectAll.checked=false;
  for (var i=0;i<form.doAction.length;i++)
  {
    form.doAction[i].checked=false;
  }
}

//Move all the elements to the top for the form of the button e.
var upf=function(e) {
  var temp=[];
  var i;
  var x;
  var formNum=getFormNum(e);
  var form=e.form;
  var state=getState(form);
  unCheckAll(form);
  for (i=0;i<form.num.length;i++) {
    x=form.num[i];
    if (x.value) {
      temp.push(x.value);
    }
  }
  if (temp.length===form.num.length || temp.length===0) return;
  for (i=0;i<temp.length;i++) {
    form.num[i].value=temp[i];
  }
  for (i=temp.length;i<form.num.length;i++) {
    form.num[i].value="";
  }
  saveState(formNum,state);
}

//Move all the elements to the bottom for the form of the button e.
var downf=function(e) {
  var temp=[];
  var i;
  var x;
  var formNum=getFormNum(e);
  var form=e.form;
  var state=getState(form);
  unCheckAll(form);
  for (i=0;i<form.num.length;i++) {
    x=form.num[i];
    if (x.value) {
      temp.push(x.value);
    }
  }
  if (temp.length===form.num.length || temp.length===0) return;
  for (i=0;i<temp.length;i++) {
    form.num[form.num.length-(temp.length-i)].value=temp[i];
  }
  for (i=temp.length;i<form.num.length;i++) {
    form.num[form.num.length-1-i].value="";
  }
  saveState(formNum,state);
} 

//Clear the form of the button e.
var clearf=function(e) {
  var i;
  var x;
  var change=false;
  var formNum=getFormNum(e);
  var form=e.form;
  var state=getState(form);
  unCheckAll(form);
  for (i=0;i<form.num.length;i++) {
    x=form.num[i];
    if (x.value) {
      x.value="";
      change=true;
    }
  }
  if (change) saveState(formNum,state);
}

//Apply unary operation op on selected pairs for the form of the button e.
var applyUniOp=function(e,op) {
  var formNum=getFormNum(e);
  var form=e.form;
  var x=form.num[getIndexOnArray(form[e.name],e)];
  var num=parseFloat(x.value);
  if (!isNaN(num)) {
    var num2=op(num);
    if (num2!==num) {
      saveState(formNum,getState(form));
      x.value=num2;
    }
  }
}

//Select/Unselect all the pairs for the form of the checkbox e.
var selectf=function(e) {
  var form=e.form;
  var x=form.selectAll.checked;
  for (var i=0;i<form.doAction.length;i++) {
    form.doAction[i].checked=x;
  }
}

//Return a vector that contain the value of the list for the form.
var getState=function(form) {
  var temp=[];
  for (var i=0;i<form.num.length;i++) {
    temp[i]=form.num[i].value;
  }
  return temp;
}

//Store the state for undo on form formNum.
var saveState=function(formNum,state) {
  redoArr[formNum]=[];
  if (undoArr[formNum].length>=MAX_UNDOS) {
    undoArr[formNum].shift();
  }
  undoArr[formNum].push(state);
}

//Change the textbox of form to the values of state.
var restoreState=function(form,state) {
  unCheckAll(form);
  for (var i=0;i<form.num.length;i++) {
    form.num[i].value=state[i];
  }
}

//Undo last change for the form of the button e.
var undof=function(e) {
  var formNum=getFormNum(e); 
  var form=e.form;
  if (undoArr[formNum].length===0) return;
  var state=undoArr[formNum].pop();
  redoArr[formNum].push(getState(form));
  restoreState(form,state);
}

//Redo last undo for the form of the button e.
var redof=function(e) {
  var formNum=getFormNum(e);
  var form=e.form;
  if (redoArr[formNum].length===0) return;
  var state=redoArr[formNum].pop();
  undoArr[formNum].push(getState(form));
  restoreState(form,state);
}

//Store the state before the change of a textbox.
var beforeChangeState;

//Store the state for the form of the textbox e.
var beforeChange=function(e) {
  var form=e.form;
  beforeChangeState=getState(form);
}

//Keep the state before the change for undo on the form of the textbox e.
var afterChange=function(e) {
  var formNum=getFormNum(e);
  saveState(formNum,beforeChangeState);
}

//Copy one chosen row on another.
var copyRow=function() {
  var actionForm=document["rowActions"];
  var fromNum=parseInt(actionForm["from"].value);
  var toNum=parseInt(actionForm["to"].value);
  if (fromNum===toNum) return;
  var calc=document["calc"];
  var fromForm=calc[fromNum];
  var toForm=calc[toNum];
  var fromState=getState(fromForm);
  var toState=getState(toForm);
  if (arraysEqual(fromState,toState)) return;
  saveState(toNum,toState);
  restoreState(toForm,fromState);
}

//Swap between two chosen rows (including theirs undo/redo).
var swapRow=function() {
  var actionForm=document["rowActions"];
  var fromNum=parseInt(actionForm["from"].value);
  var toNum=parseInt(actionForm["to"].value);
  if (fromNum===toNum) return;
  var calc=document["calc"];
  var fromForm=calc[fromNum];
  var toForm=calc[toNum];
  var fromState=getState(fromForm);
  var toState=getState(toForm);
  restoreState(toForm,fromState);
  restoreState(fromForm,toState);
  var tmp=undoArr[toNum];
  undoArr[toNum]=undoArr[fromNum];
  undoArr[fromNum]=tmp;
  tmp=redoArr[toNum];
  redoArr[toNum]=redoArr[fromNum];
  redoArr[fromNum]=tmp;
}

//Binary and unary operations.
var percent=function(x) {return x/100}
var plus=function(x,y) {return x+y}
var minus=function(x,y) {return x-y}
var mul=function(x,y) {return x*y}
var div=function(x,y) {return x/y}

//Initialization of the undo/redo and the row selection box.
var init=function() {
  var calcNum=document["calc"].length;
  var actionForm=document["rowActions"];
  for (var i=0;i<calcNum;i++) {
    undoArr.push([]);
    redoArr.push([]);
    actionForm.from.add(new Option(i+1,i, i===0 ? true : false));
    actionForm.to.add(new Option(i+1,i, i===1 ? true : false));
  }
}

