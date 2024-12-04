let boat = [];
let boatOnLeft = true;

const leftSide = document.getElementById("left-side");
const coupleContainer = document.querySelectorAll(".box");
const rightSide = document.getElementById("right-side");
const boatPassengerDiv = document.getElementById("boat-passenger");
const boatDiv = document.querySelector(".boat");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset-button");

// Add click handlers to all people
document.querySelectorAll(".person").forEach((person) => {
  person.onclick = () => selectPerson(person);
});

// Select or deselect a person for the boat
function selectPerson(person) {
  console.log(person.dataset.name);

  // Ensure the boat is on the correct side
  const personSide = person.closest(".side"); // Get the person's current side (left or right)
  const currentSide = boatOnLeft ? leftSide : rightSide; // Get the side where the boat currently is

  if (personSide !== currentSide && !boat.includes(person)) {
    showMessage(
      "The boat must return to the current side before adding or removing passengers!"
    );
    return;
  }

  if (boat.includes(person)) {
    // Remove person from the boat
    boat = boat.filter((p) => p !== person);
    person.classList.remove("selected");

    boatPassengerDiv.removeChild(person);

    // Find the correct box based on data-box-id
    const personBoxId = person.dataset.boxId; // Person's assigned box ID
    const correctBox = currentSide.querySelector(
      `.box[data-box-id='${personBoxId}']`
    ); // Find the box

    if (correctBox) {
      correctBox.appendChild(person); // Return the person to their original box
    } else {
      console.error(`Box with ID ${personBoxId} not found!`);
    }
  } else if (boat.length < 2) {
    // Add person to the boat
    boat.push(person);
    person.classList.add("selected");
    boatPassengerDiv.appendChild(person);
  }
}

// Move the boat between sides
function moveBoat() {
  if (boat.length === 0) {
    showMessage("You need at least one person on the boat to move!");
    return;
  }

  const currentSide = getCurrentSide();
  const otherSide = boatOnLeft ? rightSide : leftSide;

  // Get men and women on the boat
  const menOnBoat = boat.filter((p) => p.dataset.name.startsWith("Man"));
  const womenOnBoat = boat.filter((p) => p.dataset.name.startsWith("Woman"));

  // Get men and women on the other side
  const menOnOtherSide = Array.from(otherSide.querySelectorAll(".person"))
    .filter((p) => p.dataset.name.startsWith("Man"))
    .map((man) => man.dataset.name);
  const womenOnOtherSide = Array.from(otherSide.querySelectorAll(".person"))
    .filter((p) => p.dataset.name.startsWith("Woman"))
    .map((woman) => woman.dataset.name);

  // Check if any woman on the boat will be left without her husband
  for (const woman of womenOnBoat) {
    const womanId = woman.dataset.name.split(" ")[1];
    const husband = `Man ${womanId}`;

    // Skip the check if her husband is on the boat or there are no men on the other side
    if (
      menOnBoat.some((man) => man.dataset.name === husband) ||
      menOnOtherSide.length == 0
    ) {
      continue;
    }

    // If her husband isn't on the boat, ensure he's on the other side
    if (!menOnOtherSide.includes(husband)) {
      showMessage(
        `Invalid move! ${woman.dataset.name} cannot leave without her husband.`
      );
      return;
    }
  }

  for (const man of menOnBoat) {
    const manId = man.dataset.name.split(" ")[1];
    const wife = `Woman ${manId}`;

    // If a couple  is on the boat, ensure there is no women without their husband on the other side
    if (
      menOnOtherSide.length == 0 &&
      womenOnOtherSide.length > 0 &&
      !womenOnOtherSide.includes(wife)
    ) {
      showMessage(
        `Invalid move! ${man.dataset.name} cannot leave without his  wife.`
      );
      return;
    }
  }

  if (!isValidMove(currentSide, otherSide)) {
    showMessage(
      "Invalid move! Women cannot be alone with men other than their husbands."
    );
    return;
  }

  // Toggle boat visual direction
  if (boatOnLeft) {
    boatPassengerDiv.classList.toggle("back");
  } else {
    boatPassengerDiv.classList.remove("back");
  }

  //  move boat visually
  boatDiv.classList.toggle("move");
  // Move passengers with a delay for animation
  setTimeout(() => {
    boat.forEach((person) => {
      // Find and append to the corresponding box on the other side
      const correspondingBox = Array.from(
        otherSide.querySelectorAll(".box")
      ).find((box) => {
        return box.dataset.boxId === person.dataset.boxId;
      });

      if (correspondingBox) {
        correspondingBox.appendChild(person);
      } else {
        console.error(`No matching box found for ${person.dataset.name}`);
      }
      person.classList.remove("selected");
    });

    // Clear boat and update state
    boat = [];
    boatPassengerDiv.innerHTML = "";
    boatOnLeft = !boatOnLeft;
    showMessage("");
    // Check win condition
    checkWinCondition();
  }, 5000);
}

// Get the side the boat is currently on
function getCurrentSide() {
  return boatOnLeft ? leftSide : rightSide;
}

// Check if the move is valid
function isValidMove(currentSide, otherSide) {
  // Get names of people on the current and other sides based on the arguments
  const currentPeople = Array.from(currentSide.querySelectorAll(".person")).map(
    (p) => p.dataset.name
  );
  const otherPeople = Array.from(otherSide.querySelectorAll(".person")).map(
    (p) => p.dataset.name
  );

  // Validate both sides
  return checkSide(currentPeople) && checkSide(otherPeople);
}

// Check if a single side is valid
function checkSide(people) {
  const men = people.filter((p) => p.startsWith("Man"));
  const women = people.filter((p) => p.startsWith("Woman"));
  const womanId = women.map((woman) => woman.split(" ")[1]);
  const relatedMan = `Man ${womanId}`;

  return (
    men.length === 0 ||
    women.every((w) => men.includes(`Man ${w.split(" ")[1]}`)) ||
    men.includes(relatedMan)
  );
}

// Check if the puzzle is solved
function checkWinCondition() {
  const rightPeople = rightSide.querySelectorAll(".person");
  if (rightPeople.length === 6) {
    message.style.color = "green";
    showMessage("Congratulations! You solved the puzzle!");
    resetButton.style.display = "block";
  }
}

// Show a message to the user
function showMessage(text) {
  message.textContent = text;
}

const originalPositions = {
  "Woman A": document.querySelector(".box[data-box-id='1']"),
  "Man A": document.querySelector(".box[data-box-id='1']"),
  "Woman B": document.querySelector(".box[data-box-id='2']"),
  "Man B": document.querySelector(".box[data-box-id='2']"),
  "Woman C": document.querySelector(".box[data-box-id='3']"),
  "Man C": document.querySelector(".box[data-box-id='3']"),
};

// Reset the puzzle
function resetPuzzle() {
  // Reset the boat state
  boatOnLeft = true;
  boat = [];
  boatPassengerDiv.innerHTML = ""; // Clear the boat visually

  // Move each person back to their original box
  Object.keys(originalPositions).forEach((personName) => {
    const person = document.querySelector(`.person[data-name='${personName}']`);
    const box = originalPositions[personName];

    if (person && box) {
      box.appendChild(person); // Move person back to their original box
    } else {
      console.error(`Error: Missing person or box for ${personName}`);
    }
  });

  // Reset messages
  message.textContent = "";
  resetButton.style.display = "none";

  // Reset boat animation
  boatDiv.classList.remove("move");
}
//arrows
resetButton.addEventListener("click", resetPuzzle);

const leftArrow = document.querySelector(".left");
const rightArrow = document.querySelector(".right");

leftArrow.addEventListener("click", () => {
  if (!boatOnLeft) {
    moveBoat();
  } else {
    showMessage("The boat is already on the left side!");
  }
});

rightArrow.addEventListener("click", () => {
  if (boatOnLeft) {
    moveBoat();
  } else {
    showMessage("The boat is already on the right side!");
  }
});
