
function openForm(user,shift) {
  console.log(shift);
  var temp = shift;
  console.log(document.getElementById("temp_").innerHTML.slice(9,11));
  document.getElementById("useridrate").innerHTML = "Rate " + user;
  document.getElementById("user_id_input").value =  user;
//   document.getElementById("manager_id_input").value=  document.getElementById("temp_").value;
  document.getElementById("shift_id_input").value=  shift;
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}


function search() { //For searchinf table

  if(document.getElementById('Name_Search').checked) {   
       var selectedValue = document.getElementById('Name_Search').value;  
  }
  
  if(document.getElementById('User_id_Search').checked) {   
       var selectedValue = document.getElementById('User_id_Search').value;  
  }

  if(document.getElementById('Shift_id_Search').checked) {   
       var selectedValue = document.getElementById('Shift_id_Search').value;  
  }

  if(document.getElementById('Date_Search').checked) {   
       var selectedValue = document.getElementById('Date_Search').value;  
  }
  console.log( typeof parseInt(selectedValue));
  var element1 = document.getElementById("Nore");
  var element2 = document.getElementById("Table");
  var input, filter, table, tr, td, i, txtValue;
  
  var temp2 = document.getElementById('myTable').rows.length-1;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[parseInt(selectedValue)];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
		tr[i].style.display = "none";
		
      }
    } 
  
}
var temp1 = document.getElementById("myTable").querySelectorAll('[style="display: none;"]').length; 
if(temp1 == temp2)
  {
	element1.style.display = "block";
	element2.style.display = "none";
	
  } 
  
else
{
	element1.style.display = "none";
	element2.style.display = "block";

}
  
  
}

function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('clock').innerHTML =  h + ":" + m + ":" + s;
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}


$(document).ready(function () {
    $("#userdetails").click(function () {
        $('#test').fadeIn();
        $('#dashboard').fadeOut();
    });

    $("#shiftdetails").click(function () {
        $('#dashboard').fadeIn();
        $('#test').fadeOut();
    });


}); 