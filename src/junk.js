

let Person = {
    name: "Allie",
    greet: function() {
        console.log("my name is " + this.name)
    }
}
Person.greet();


const animal = {
    name: "Samson",
    eyeColor: "yellow"
};
const customFunction = Person.greet.bind(animal)
customFunction();





