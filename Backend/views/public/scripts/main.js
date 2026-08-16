document.addEventListener("DOMContentLoaded", function() {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
          }
          form.classList.add('was-validated');
      }, false);
  });

  let taxSwitch = document.getElementById('flexSwitchCheckDefault');
  if (taxSwitch) {
      let taxInfo = document.getElementsByClassName('tax-info');
      taxSwitch.addEventListener('click', () => {
          console.log("Clicked");
          for (let info of taxInfo) {  // Declare 'info' with 'let'
              if (info.style.display !== "inline") {
                  info.style.display = 'inline';
              } else {
                  info.style.display = 'none';
              }
          }
      });
  } else {
      console.error("Element with ID 'flexSwitchCheckDefault' not found.");
  }
  
});