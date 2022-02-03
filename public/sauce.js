//find the delete-button in the document
const deleteBtn = document.querySelector('#delete-btn')

//find the like button in the document
const likeBtn = document.querySelector('#like-btn')

//find the like counter in the document
const likeCounter = document.querySelector('#like-counter')

//get the current sauceID from the url
const id = window.location.pathname.split('/sauces/')[1]

//add event to delete this sauce
deleteBtn.addEventListener('click', async () => {
    //fetch sauce route for this id with the DELETE method
    let res = await fetch(`/sauces/${id}`, {
        method: 'DELETE'
    })
    console.log(res)
    //send user back to the sauces path
    window.location.assign('/sauces')
  });

//add an event to Like this sauce
likeBtn.addEventListener('click', async () =>{
    //get current likes from counter
    let currentLikes = parseInt(likeCounter.innerHTML)
    console.log(currentLikes)
    //Increment current likes
    currentLikes ++
    //update the likes counter
    likeCounter.innerHTML = currentLikes
    //fetch the route for this id with the PUT method
    let res = await fetch(`/sauces/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            likes: currentLikes
        })
    })
})

