function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return (true)
  } else {
    alert("You have entered an invalid email address!")
    return (false)
  }
}



console.log(validateEmail('gillesgmail.com'))