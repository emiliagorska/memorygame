

//DECLARE THE VARIABLES THAT WILL BE LATER NEEDED IN THE CODE

var buttonToStartTheGame; //button that will start the game,
var numberOfDogs; //variable that will hold the number of dogs that are in the game (if user chooses easy level, it will be 4, normal level - 6 and hard - 9 dogs)
var pictures; //variable that will have the the array of dogs fetched from the dogs API attached to it
var newArrayWithDogs; //variable that will hold the dogs that are in the game - so 6 dogs, each of the times 2, and in a random order
var clickedImagesArray; //variable that will temporarily hold the dogs that are clicked by the user
var userClicks; //variable that will hold the number of clicks the user needed to finish the game
var imageClickedCount; //variable that will temporarily hold the number of clicks - so that if the user clicks the third image in the row, the previous two images will first dissapear, befor ethe 3rd image is displayed
var easyRecord = window.localStorage.getItem(`bestEasyScore`); //variable holding the user`s personal record of clicks for the easy level
var normalRecord = window.localStorage.getItem(`bestNormalScore`); //variable holding the user`s personal record of clicks for the normal level
var hardRecord = window.localStorage.getItem(`bestHardScore`); //variable holding the user`s personal record of clicks for the hard level
var breeds; //variable that will hold the fetched breeds of dogs
var breedId; //variable that will hold the id of a chosen breed
var myTimer; //variable that will hold the stInterval function that will create the timer every time the user starts a new game
var index = 0; // variable that will be used in the function that will show  display breeds of dogs on the screen. The index will 
var breedsSliced = []; //array that will contain smaller arrays, each containing 10 or 11 breeds of dogs


//displaying the best scores if any are saved locally
if (window.localStorage.getItem(`bestEasyScore`) !== null) {
    document.getElementById(`easy-personal-record`).innerHTML = `Personal record at easy level: ${easyRecord} opened pairs`;
}

if (window.localStorage.getItem(`bestNormalScore`) !== null) {
    document.getElementById(`normal-personal-record`).innerHTML = `Personal record at normal level: ${normalRecord} opened pairs`;
}
if (window.localStorage.getItem(`bestHardScore`) !== null) {
    document.getElementById(`hard-personal-record`).innerHTML = `Personal record at hard level: ${hardRecord} opened pairs`;
}

//HERE ARE THE MAIN FUNCTIONS SUPPORTING THE GAME SETUP
/* The logic:
    1. once the window onloads, the intialise function is called
    2. the initialise function will add breed options, add event listeners to buttons, set the timer
    3. the added event listener in the previous step means that if user clicks the `start the game`button`, the mainSetup function is called
    4. The main setup function will first clear the previous game setup (if there was a previous game), fetch the data needed based on user preferences and call the function that prepares the grid for the game;
*/
// 1. what happens after window onloads
window.onload = initialise;

    function initialise() {
    //buttons setting difficulty get assigned eventl listeners
    document.getElementById(`easy`).addEventListener(`click`, function() {numberOfDogs = 4});
    document.getElementById(`normal`).addEventListener(`click`, function() {numberOfDogs = 6});
    document.getElementById(`hard`).addEventListener(`click`, function() {numberOfDogs = 9});
    addRadioButtons();
    //button to start the game gets assigned event listener
    buttonToStartTheGame = document.getElementById(`button-to-start-the-game`);
    buttonToStartTheGame.addEventListener(`click`, function() {
        clearInterval(myTimer);
        document.getElementById(`time`).innerHTML = ``;
        if (numberOfDogs == 4) {
            settingTimer(30);
        } else if (numberOfDogs == 6) {
            settingTimer(40);
        } else if (numberOfDogs == 9) {
            settingTimer(59);
        }
        mainSetup(numberOfDogs);
}) }


 // 2. Function that will be called when the user starts new game
function mainSetup(numberOfDogs) {
    //previous data cleared
    clearData();
    //depending on whether the user chose a breed or not, different dogs will be fetched
    if (parseInt(breedId) > 0) {
        fetch(`https://api.thedogapi.com/v1/images/search?limit=${numberOfDogs}&mime_types=jpg&breed_id=${breedId}`)
        .then(function(response) {
            return response.json()
         })
        .then(function(data) {
            //the fetched dogs assigned to the `pictures` variable
            pictures = data;
            if (numberOfDogs !== pictures.length) {
                document.getElementById(`time`).textContent = ``;
                alert(`sorry, there is not enough pictures of the dog of this breed, please try select different breed or/and lower difficulty level`);
                addRadioButtons();
            } else {
                setUp();
            }    
        } )
        .catch(error => {console.log(error); document.write(error + ` We are sorry, a problem occured and we could not fetch the dog pictures needed to start the game. Please try refreshing the page`)
    } )
    } else {
        fetching();
    }
}

//AUXILIARY FUNCTIONS THAT HELP WITH THE GAME SET UP

//adding the buttons for breed selection
function addRadioButtons() {
    //listener fro the button next - with each click it will remove all child of radio buttons and it will append new children
    document.getElementById(`radio-buttons`).textContent = ``;
    fetch(`https://api.thedogapi.com/v1/breeds`)
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        //the fetched dogs assigned to the `pictures` variable
        breeds = data; 
        //split
        var breedsSliced = [];
        index = 0;
        //function displaying 10-11 radio buttons at once.
        function showTenBreeds() {
            //it will loop through the small array of breeds (containg 10 or 11 breeds) and add the breeds to the page
            for (i = 0; i < breedsSliced[index].length; i++) {
                var input = document.createElement(`input`);
                var label = document.createElement(`label`);
                input.type = `radio`;
                input.id = breedsSliced[index][i].id;
                label.for = breedsSliced[index][i].name;
                label.innerHTML = breedsSliced[index][i].name;
                document.getElementById(`radio-buttons`).appendChild(input);
                document.getElementById(`radio-buttons`).appendChild(label);
            }
        }
        //slicing the breeds array into array containing smaller arrays with 10-11 breeds 
        for (let i = 17; i > 0; i--) {
                breedsSliced.push(breeds.splice(0, Math.ceil(breeds.length / i)));
            }
        showTenBreeds();
        document.getElementById(`previous-breeds`).addEventListener(`click`, function() {if (index !== 0) {
            index--; clearRadioButtons(); showTenBreeds()} })
        document.getElementById(`next-breeds`).addEventListener(`click`, function() {if (index < breedsSliced.length - 1) {
                index++; clearRadioButtons(); showTenBreeds() } })    
        //function returning the small array from breeds array
        document.addEventListener(`click`, function (event) {
            //if the user did not click within the area of the grid buttons, nothing happens
            if (!event.target.type == `radio`) {
                return; 
            } else {
                breedId = event.target.id;
            }
        }, false);
        }) 
        .catch(error => {console.log(error); document.write(` We are sorry, a problem occured and we could not fetch the dog pictures needed to start the game. Please try refreshing the page`)
    } ) }

//function to clear radio buttons
function clearRadioButtons() {
    document.getElementById(`radio-buttons`).innerHTML = ``
}

//function that fetches dogs, without looking at the breed
function fetching() {
    fetch(`https://api.thedogapi.com/v1/images/search?limit=${numberOfDogs}&mime_types=jpg`)
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        pictures = data;
        setUp()
    } )
    .catch(error => {console.log(error); document.write(` We are sorry, a problem occured and we could not fetch the dog pictures needed to start the game. Please try refreshing the page`)
    } )
}  

//function that sets up the grid
function setUp() { 
    // empty button tags added to the page - their number dependant on the difficulty level of the game
    addButtonTags();
    //empty image tags added to the page - their number dependant on the difficulty of the game
    addImageTags();
    //relevant grid style created - dependant on the number of dogs in the game
    createTheGrid();
    //fetched dogs put into new array, where they get shuffled, so that their order in the grid be random
    createShuffledArray();
    //the shuffled array of dogs gets assigned to the grid elements
    assignPicturesToBoxes();
    //function that adds event listeners to each of the buttons. after a button gets, clicked, the picture associated with it will be revealed
    clickEvents();
}
    

// FUNCTION TO CLEAR THE PREVIOUS DATA
//function that will be used to clear out any previous data 
function clearData() {
    document.getElementById(`congratulations`).innerHTML = ``;
    var gameElement = document.getElementById(`game`);
    gameElement.remove();
    var gridForGame = document.getElementById(`grid-for-game`);
    newGameElement = document.createElement(`div`);
    newGameElement.id = `game`;
    gridForGame.appendChild(newGameElement);
    imageClickedCount = 0;
    clickedImagesArray = [];
    pictures = [] ;
    newArrayWithDogs = [];
    userClicks = 0;
}

// function that adds empty button tags to the page
function addButtonTags() {
    for (i = 1; i < (numberOfDogs*2 + 1); i++) {
        var buttonPlace = document.createElement(`button`);
        buttonPlace.style = `width:150px;height:150px;`;
        buttonPlace.id = `box${i}`;
        buttonPlace.classList.add(`box`);
        var divElement = document.getElementById(`game`);
        divElement.appendChild(buttonPlace);
    }
}


// function that adds empty image tags to the page
function addImageTags() {
    for (i = 1; i < (numberOfDogs*2 + 1); i++) {
        var imagePlace = document.createElement(`img`);
        imagePlace.style = `width:150px;height:150px;`;
        imagePlace.id = `image${i}`;
        imagePlace.classList.add(`img-unmatched`);
        var currentBox = document.getElementById(`box${i}`);
        currentBox.appendChild(imagePlace);
    }
}


// function that will create the grid based on the number of dogs it has to contain
function createTheGrid() {
    if (numberOfDogs == 4) {
        setGridStyle(`600px`, `150px 150px 150px 150px`, `150px 150px`);
    } else if (numberOfDogs == 6) {
        setGridStyle(`600px`, `150px 150px 150px 150px`, `150px 150px 150px`);
    } else if (numberOfDogs == 9) {
        setGridStyle(`900px`, `150px 150px 150px 150px 150px 150px`, `150px 150px 150px`);
    }
    }

// auxiliary function that will help set the grid dimensions
function setGridStyle(widthValue, TemplateColumnsValues, TemplateRowsValues ) {
    document.getElementById(`game`).style.width = widthValue;
    document.getElementById(`game`).style.gridTemplateColumns = TemplateColumnsValues;
    document.getElementById(`game`).style.gridTemplateRows = TemplateRowsValues;
}
    



// function that will create an array with 12 dogs (6 pairs) and then shuffle it
function createShuffledArray() {
    newArrayWithDogs = [...pictures];
    newArrayWithDogs.push(...pictures);
    for (var i = newArrayWithDogs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = newArrayWithDogs[i];
        newArrayWithDogs[i] = newArrayWithDogs[j];
        newArrayWithDogs[j] = temp;
    }
}


// function that will assign the pictures to image tags in html, by creating an attribute to each image tag that will contain the URL of the corresponding dog
function assignPicturesToBoxes() {
    for (i = 1; i < (numberOfDogs*2 + 1); i++) {
        document.getElementById(`image${i}`).setAttribute(`url`,`${(newArrayWithDogs[i-1]).url}`);
    }
}

// function that will assign event listeners to all the buttons.
function clickEvents() {
    document.querySelectorAll(`.box`).forEach(item => {
        item.addEventListener(`click`, function() {
            var image = item.firstElementChild;
            //After a button is clicked, its `src` attribute gets assigned a value that was previously stored in a newly created `url` attribute
            image.setAttribute(`src`, image.getAttribute(`url`));
        })
    })
    }

   

//HERE ARE THE FUNCTIONS THAT WILL SUPPORT THE GAME HAPPENING
/* logic:
    1. if any of the buttons  of the grid of game gets clicked, some variables will get updated, and the makeTheGame function that supports the game happening is called
    2.the makeTheGame function that is called is determing which images stay open and when the game is finished
*/
// 2. This code says what happens if any of the buttons gets `clicked`;
document.addEventListener(`click`, function (event) {
    //if the user did not click within the area of the grid buttons, nothing happens
    if (!event.target.classList.contains(`img-unmatched`)) {
        return; 
    } else {
        //if the user clicked within the area of the grid buttons, the number of user clicks gets updates, the variable temporarily holding the number of user clicks also gets updated (if it reaches 3, it will, the number will be reset to 0 it the `makeTheGame` function) and the clicked image is added to a temporary array, and the makeTheGame function is called;
        userClicks++;
        clickedImagesArray.push(event.target);
        imageClickedCount++; 
        makeTheGame();
    }
}, false);


// 3. This function actually supports the game happening, as is called every time any of the buttons that have a picture assigned gets clicked, it does different  actions depending on whether the picture revealed by the user is the second picture revealed in that turn, or if the new turn is starting
function makeTheGame() {
    if(imageClickedCount == 2) {
        if(clickedImagesArray[0].getAttribute(`url`) == clickedImagesArray[1].getAttribute(`url`)) { 
            //set the new class name for both the pictures that are matched
            changeClass(0);
            changeClass(1);
            //delete the content of clickedImagesArray - it should only contain 2 dog pictures at the time
            clickedImagesArray.splice(0,2);
            //what will happen if all the images are revealed
            if ((document.getElementsByClassName(`img-matched`)).length == (numberOfDogs*2)) {
                //timer will be removed
                document.getElementById(`time`).innerHTML = ``;
                clearInterval(myTimer);
                //congratulations will be displayed on the screen
                document.getElementById(`congratulations`).innerHTML = `Congratulations, you completed the game!`;
                //next piece of code sets personal records at easy, normal and hard level
                if (numberOfDogs == 4 && ((userClicks/2) < easyRecord || easyRecord == null)) {
                    easyRecord = userClicks/2;
                    var easyRecordString = String(easyRecord);
                    window.localStorage.setItem(`bestEasyScore`, easyRecordString);
                    document.getElementById(`easy-personal-record`).innerHTML = `Personal record at easy level: ${userClicks/2} opened pairs`;
                } else if (numberOfDogs == 6 && ((userClicks/2) < normalRecord || normalRecord == null)) {
                    normalRecord = userClicks/2;
                    normalRecordString = String(normalRecord);
                    window.localStorage.setItem(`bestNormalScore`, normalRecordString);
                    document.getElementById(`normal-personal-record`).innerHTML = `Personal record at normal level: ${userClicks/2} opened pairs`;
                } else if (numberOfDogs == 9 && ((userClicks/2) < hardRecord || hardRecord == null)) {
                    hardRecord = userClicks/2;
                    hardRecordString = String(hardRecord);
                    window.localStorage.setItem(`bestHardScore`, hardRecordString);
                    document.getElementById(`hard-personal-record`).innerHTML = `Personal record at hard level: ${userClicks/2} opened pairs`;
                }
            //after finishing the game, the tracked number of user clicked is set to 0;
            userClicks = 0;
            }
        } else {
             //delete the content of clickedImagesArray - it should only contain 2 dog pictures at the time
            clickedImagesArray.splice(0,2);
        }
    } else if(imageClickedCount == 3) {
        reassignSrcAttribute();
        assignSrcAttribute(findingIndex(0));
        imageClickedCount = 1; 
    }
    }

//AUXILIARY FUNCTIONS THAT CONTAIN RE-USABLE BITS OF CODE THAT ARE NEEDED IN THE MAIN GAME-SUPPORTING FUNCTIONS DESCRIBED ABOVE
// function that sets the timer
    function settingTimer(seconds) {
        var sec = seconds;
        var timer = document.createElement(`p`);
        document.getElementById(`time`).appendChild(timer);
        myTimer = setInterval(function() {
            timer.innerHTML = `00:`+ sec;
          sec--;
          if (document.getElementsByClassName(`img-matched`).length == (numberOfDogs*2)) {clearInterval(myTimer); timer.remove();}
          if (timer.innerHTML == `00:0` && !(document.getElementsByClassName(`img-matched`).length == (numberOfDogs*2)) ) {clearInterval(myTimer); timer.remove(); document.getElementById(`game`).textContent = `Sorry, you run out of time! Try again!`}
    }, 1000) }




// 1. function that will find the index of the image that was clicked (0 to 11) and return it
function findingIndex(numberInClickedImagesArray) {
    var nodeList = document.getElementsByTagName(`img`);
    var array = Array.from(nodeList);
    return elementClickedIndex = (array.indexOf(clickedImagesArray[numberInClickedImagesArray])) + 1;
}

// 2. function that wil set the Src attribute to the value stored in url
function assignSrcAttribute(number) {
    var image = document.getElementById(`image${number}`);
    image.setAttribute(`src`, image.getAttribute(`url`));
}

// 3. function that will erase the content of src attribute
 function reassignSrcAttribute() {
    document.querySelectorAll(`.img-unmatched`).forEach(item => {
    item.setAttribute(`src`, ``);
})
}

// 4. function that will change the class of the correctly paired images to `matched`
function changeClass(index) {
    var image = document.getElementById(`image${findingIndex(index)}`);
image.setAttribute(`class`, `img-matched`);
}


