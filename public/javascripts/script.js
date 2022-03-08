class Model {
  constructor() {
    this.contacts = null
    this.onContactListChanged = null
  }

  receiveContacts(contacts) {
    this.contacts = contacts
    this.onContactListChanged(this.contacts)
  }

  bindOnContactListChanged(callback) {
    this.onContactListChanged = callback
  }

  findMatchingContacts(value, callback, template) {
    let self = this;
    let length = value.length
    let result;
    result = self.contacts.filter(function(contact) {
      if (contact.full_name.slice(0, length) === value) {
        return true
      }
    })
    callback(result, template);
  }

  findMatchingTags(tag) {
    let result = this.contacts.filter(function(object) {
      if (object.tags.split(',').includes(tag)) {
        return true
      }
    })
    return result
  }
}

class View {
  constructor() {
    this.$form = $('#form');
    this.mainBody = document.querySelector('#mainBody')
    this.$allContacts = $('#allContacts');
    this.$form.hide();
    this.$tagResults = $(document.querySelector('#tagResults'))
    this.$tagResults.hide()
    this.$tagResultsContainer = $(document.querySelector('#tagResultsContainer'))
    this.$cancel = $('#cancel')
    this.itemTemplate = this.generateItemTemplate()
    this.formTemplate = this.generateFormTemplate()
    this.submitter = document.querySelector('#submitter');
    this.searchBar = document.querySelector('input');
    this.$searchResults = $('#searchResults')
  }

  generateItemTemplate() {
    Handlebars.registerPartial('tagsPartial', $('#tagsPartial').html())
    let template = document.querySelector('#itemMakerTemplate').innerHTML;
    let script = Handlebars.compile(template);
    return script;
  }

  generateFormTemplate() {
    let template = document.querySelector('#formTemplate').innerHTML;
    let script = Handlebars.compile(template);
    return script
  }

  displayContacts(contacts) {
    let self = this;
    this.$allContacts.empty();
    if (contacts.length === 0) {
      let noContacts = document.createElement('h3');
      noContacts.textContent = 'There are no contacts'
      self.$allContacts.append(noContacts)
      let addContact = document.createElement('a');
      addContact.textContent = 'Add Contact';
      addContact.href = '#'
      self.$allContacts.append(addContact)
    } else {
      contacts.forEach(contact => {
        let tempDiv = document.createElement('div');
        let contactHTML = this.itemTemplate({
          name: contact.full_name,
          number: contact.phone_number,
          email: contact.email,
          tags: contact.tags.split(','),
          id: contact.id
        });
        tempDiv.innerHTML = contactHTML;
        self.$allContacts.append(tempDiv.firstElementChild)
      })
    }
  }

  displayHomePage() {
    let form = document.querySelector('form');
    if (form) {
      form.remove()
    }
    this.$allContacts.show()
  }

  addListeners() {
    let self = this;
    document.body.addEventListener('click', function(event) {
      if (event.target.tagName === 'A' && event.target.textContent === 'Add Contact') {
        event.preventDefault();
        let tempDiv = document.createElement('div');
        let newContactForm = self.formTemplate({formType: 'addContact'})
        tempDiv.innerHTML = newContactForm;
        self.mainBody.append(tempDiv)
        self.$allContacts.hide()
      }
    })

    document.body.addEventListener('click', function(event) {
      event.preventDefault();
      if (event.target.id === 'cancel') {
        let form = event.target.closest('form');
        form.remove()
        self.$allContacts.show()
      }
    });

    document.body.addEventListener('click', function(event) {
      event.preventDefault();

      let target = event.target;
      if (target.tagName === 'A' && target.textContent === "Back to all contacts") {
        self.$tagResultsContainer.empty();
        self.$tagResults.hide();
        self.$allContacts.show();
      }
    })
  }

  retrieveInput(handler) {
    let self = this
    self.searchBar.addEventListener('keyup', function(event) {
      event.preventDefault()
      let value = self.searchBar.value
      
      if (value.length > 0) {
        handler(value, self.itemTemplate)
        self.$allContacts.hide()
        self.$searchResults.show()

      } else if (value.length === 0 && event.keyCode === 8) {
        self.$searchResults.empty()
        self.$searchResults.hide()
        self.$allContacts.show()
      }

    })
  }

  displaySearchResults(result, view) {
    let uniqueArray = []
    
    if (result.length > 0) {
      uniqueArray = result.map(function(aResult) {
        let tempDiv = document.createElement('div');
        let contactHTML = view.itemTemplate({
        name: aResult.full_name,
        number: aResult.phone_number,
        email: aResult.email,
        tags: aResult.tags.split(','),
        id: aResult.id
      });
      tempDiv.innerHTML = contactHTML;
      return tempDiv
      })
      view.$searchResults.empty()
      uniqueArray.forEach(aDiv => view.$searchResults.append(aDiv))
    } else {
      view.$searchResults.empty()
      let tempH3 = document.createElement('H3');
      tempH3.textContent = `There are no results for "${view.searchBar.value}".`
      view.$searchResults.append(tempH3)
    }

  }

  bindCheckForTags(handler) {
    let self = this;
    document.addEventListener('click', function(event) {
      event.preventDefault();
      let target = event.target
      if (target.tagName === 'BUTTON') {
        let results = handler(target.textContent);
        results.forEach(function(aResult) {
          let tempDiv = document.createElement('div');
          let contactHTML = self.itemTemplate({
          name: aResult.full_name,
          number: aResult.phone_number,
          email: aResult.email,
          tags: aResult.tags.split(','),
          id: aResult.id
          });
          tempDiv.innerHTML = contactHTML;
          self.$tagContainer = $(document.querySelector('#tagResultsContainer'))
          self.$tagContainer.append(tempDiv.firstElementChild)
          self.$searchResults.empty()
          self.$searchResults.hide()
          self.$allContacts.hide()
          self.$tagResults.show()
        })
      }
    })
  }
  
  bindUpdateContactForm(handler) {
    let self = this
    
    document.body.addEventListener('click', function(event) {
      event.preventDefault();
      let target = event.target
      
      if (target.tagName === 'A' && target.getAttribute('value') === 'edit') {
        let siblings = $(target).siblings()
        let name = siblings[0].textContent;
        let phoneNumber = siblings[3].textContent
        let email = siblings[5].textContent
        let tags = siblings[7].textContent.trim()
        let tempDiv = document.createElement('div');
        let newContactForm = self.formTemplate({formType: 'editContact'})
        tempDiv.innerHTML = newContactForm;
        tempDiv.querySelector('[name="full_name"]').placeholder = name
        tempDiv.querySelector('[name="email"]').placeholder = email
        tempDiv.querySelector('[name="phone_number"]').placeholder = phoneNumber
        tempDiv.querySelector('[name="tags"]').placeholder = tags

        self.mainBody.append(tempDiv)
        self.$allContacts.hide()
        
        let submitter = document.querySelector('#submitter')
        submitter.addEventListener('click', function(event) {
          event.preventDefault();

          let form = document.querySelector('form');
          let data = new FormData(form)
          let tagsContent = data.get('tags').split(' ')
          let uniqueTags = [...new Set(tagsContent)].join(',')
          data.set('tags', uniqueTags)
          if (self.validateData(data)) {
            console.log('test')
            let path = target.href
            let dataString = new URLSearchParams(data).toString();
            handler(dataString, path)
          }
        })
      }
    })
  }

  bindAddContactForm(handler) {
    let self = this
    document.body.addEventListener('click', function(event) {
      event.preventDefault();
      let target = event.target;
      
      if (target.id === 'submitter' && target.closest('form').getAttribute('type') === 'addContact') {
        let form = document.querySelector('form');
        let data = new FormData(form);
        let tagsContent = data.get('tags').split(' ')
        let uniqueTags = [...new Set(tagsContent)].join(',')
        data.set('tags', uniqueTags)
        if (self.validateData(data)) {
          let dataString = new URLSearchParams(data).toString();
          handler(dataString)
        } 
        
      }
    })
  }

  bindDeleteContact(handler) {
    let self = this;
    document.body.addEventListener('click', function(event) {
      event.preventDefault();
      let target = event.target;

      if (target.getAttribute('value') === 'delete') {
        handler(target.getAttribute('href'))
        self.$tagResultsContainer.empty();
        self.$tagResults.hide()
        self.$searchResults.empty()
        self.$searchResults.hide()
      }
    })
  }

  validateData(data) {
    let self = this
    let name = data.get('full_name')
    let email = data.get('email')
    let phone_number = data.get('phone_number')
    let tags = data.get('tags')
    if (name.length > 0 && email.length > 0 && tags.length >0) {
      if (String(phone_number).length === 10) {
        if (self.validateEmail(email)) {
          return true
        } 
      } else {
        alert('The phone number must be 10 digits long.')
        return false
      }
    } else {
      alert('All fields require to be filled')
      return false
    }
  }
  
   validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return (true)
    } else {
      alert("You have entered an invalid email address!")
      return (false)
    }
   }
   
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.addListeners()
    
    this.getContacts()
    this.model.bindOnContactListChanged(this.onContactListChanged);
    this.view.bindAddContactForm(this.handlerAddContact);
    this.view.bindUpdateContactForm(this.handlerUpdateContact);
    this.view.bindDeleteContact(this.handleDeleteContact);
    this.view.retrieveInput(this.onValueSearched)
    this.view.bindCheckForTags(this.onTagSearch)
  }

  getContacts() {
    fetch("/api/contacts", {
      method: 'GET' 
    })
    .then(response => response.json())
    .then(json => {
      this.model.receiveContacts(json);
      this.view.displayHomePage();
    })
  }

  handlerAddContact = (contactData) => {
    fetch('api/contacts', {
      method: 'POST',
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: contactData,
    })
    .then(() => {
      this.getContacts();
    })
  }

  handlerUpdateContact = (contactData, path) => {
    fetch(path, {
      method: 'PUT',
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: contactData,
    })
    .then(() => {
      this.getContacts();
    })
  }

  handleDeleteContact = (path) => {
    fetch(path, {
      method: 'DELETE',
    })
    .then(() => {
      this.getContacts();
      this.getContacts();
    })
  }

  onContactListChanged = (contactData) => {
    this.view.displayContacts(contactData)
  }

  onValueSearched = (searchItem) => {
    this.model.findMatchingContacts(searchItem, this.view.displaySearchResults, this.view)
  }

  onTagSearch = (tagText) => {
    return this.model.findMatchingTags(tagText)
  }

}

let app;
document.addEventListener('DOMContentLoaded', function(e) {
  app = new Controller(new Model(), new View());
});