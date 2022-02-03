//onclick function to delete a sauce by id
async function deleteSauce(id){
    //delete a sauce matching parameter id
    let res = await fetch(`/sauces/${id}` ,{
        method: 'DELETE'
    })
    console.log(res)
    //send user back to the sauces path
    window.location.assign('/sauces')
}