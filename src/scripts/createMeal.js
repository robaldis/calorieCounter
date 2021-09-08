function addIngredient() {
    var itm = document.getElementById("ingredient");
    var cln = itm.cloneNode(true);
    var ingredients = document.getElementsByClassName("ingredient");

    // Change the name of the clone to make it a different element in the list
    cln.children[0].name = cln.children[0].name.replace("0", `${ingredients.length}`)
    cln.children[1].name = cln.children[1].name.replace("0", `${ingredients.length}`)

    document.getElementById("ingredients").appendChild(cln);
}
