//select the form inputs in the dom
const nameField = document.querySelector('#name')
const imageField = document.querySelector('#image')

//add an event to edit this sauce by id
 let editSauce = async (id) =>{
     //store current value of inputs as constants
    const newName = nameField.value
    const newImage = imageField.value
    //fetch the route for this id with the PUT method
    let res = await fetch(`/sauces/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: newName,
            image: newImage
        })
    })
    window.location.assign(`/sauces/${id}`)
}