// Get the trash div
const trashDiv = document.getElementById('trash')
// Div for the game
const gameDiv = document.createElement('div')
trashDiv.appendChild(gameDiv)
gameDiv.id = 'game'

// Div for pre game info and start game button
const preGameInfo = document.createElement('div')
gameDiv.appendChild(preGameInfo)
preGameInfo.id = 'pre-game-info'
// Div for pre game info text
const infoTextDiv = document.createElement('div')
preGameInfo.appendChild(infoTextDiv)
infoTextDiv.id = 'pre-game-info-text'
infoTextDiv.innerHTML = 'Använd piltangerna eller W-A-S-D för att styra grisen och mellanslag för att göra en snabbrusning. Du kan skjuta en bumerang på C som förstör skräp men du har bara en bumerang per level. Samla 7 majskolvar för att komma till nästa level. Du förlorar om du träffar skräp som ramlar ner från himlen.'
// Start game button
const startGameButton = document.createElement('button')
preGameInfo.appendChild(startGameButton)
startGameButton.id = 'start-trash'
startGameButton.innerHTML = 'Starta Trash'
startGameButton.addEventListener('click', function () {
  preGameInfo.remove()
  trashGame(trashDiv, gameDiv)
})

/**     
 * Starts a game of 'Trash'.
 * @param {HTMLElement} trashDiv - The outer div for the game and game info.
 * @param {HTMLElement} gameDiv - The div to show the game in.
 */
function trashGame (trashDiv, gameDiv) {
  // Div for the character
  const characterDiv = document.createElement('div')
  gameDiv.appendChild(characterDiv)
  characterDiv.id = 'character'
  // Img for the character
  const characterImg = document.createElement('img')
  characterDiv.appendChild(characterImg)
  characterImg.src = './img/trash/pig.png'

  // Hide the cursor
  hideCursor()
  // If clicked, show cursor again
  setTimeout(function () {
    document.addEventListener('click', showCursor)
  }, 1000 / 1000)
  // FPS
  const fps = 60
  // Character speed/length per movement
  const characterSpeed = 3
  // id for the interval that moves the character
  let charecterMovingIntervalId
  // Current character direction
  let curDirection = 'none'
  // Latest character direction
  let latestCharacterDirection = 'up'
  // id for the interval that moves the boomerang
  let boomerangMovingIntervalId
  // Boomerang speed
  const boomerangSpeed = 8
  // Boomerangs max per level
  const boomerangsPerLevel = 1
  // Boomerangs thrown this level
  let boomerangsThrown = 0
  // Boolean for if the dash is usables
  let isDashUsable = true
  // Dash cooldown in seconds
  const dashCooldownSec = 2

  // Pressing down a key
  document.addEventListener('keydown', function (event) {
    // Get the key pressed down
    const key = event.key
    // Boolean for if key is a movementkey
    let isMovementKey = false
    // Set the moving direction based on the key pressed
    let newDirection
    if (key === 'ArrowLeft' || key === 'a') {
      newDirection = 'left'
      isMovementKey = true
    } else if (key === 'ArrowRight' || key === 'd') {
      newDirection = 'right'
      isMovementKey = true
    } else if (key === 'ArrowUp' || key === 'w') {
      newDirection = 'up'
      isMovementKey = true
    } else if (key === 'ArrowDown' || key === 's') {
      newDirection = 'down'
      isMovementKey = true
    }
    // If the new direction is different from the current one and it's a movement key
    if (newDirection !== curDirection && isMovementKey) {
      // Update the current character direction
      curDirection = newDirection
      // Update the latest character direction
      latestCharacterDirection = newDirection
      // Clear any existing interval moving the character
      clearInterval(charecterMovingIntervalId)
      // Start interval that moves the character in the 'newDirection'
      charecterMovingIntervalId = setInterval(function () {
        moveElement(characterDiv, newDirection, characterSpeed, 'character')
      }, 1000 / fps)
    }
    // If key is space
    if (key === ' ') {
      // Remove the default behavior of a space press
      event.preventDefault()
      if (isDashUsable) {
        // Make dash not usable
        isDashUsable = false
        // Timeout for making the dash usable again
        setTimeout(function () {
          isDashUsable = true
        }, 1000 * dashCooldownSec)
        // Show a lottie player, wind
        addWindLottiePlayerElement()
        // Temporary remove the current interval for moving the character
        clearInterval(charecterMovingIntervalId)
        // Move the character long, a dash.
        const times = 40
        const length = 2
        for (let i = 0; i < times; i++) {
          moveElement(characterDiv, latestCharacterDirection, length, 'character')
        }
        // Restart the normal interval that moves the character
        charecterMovingIntervalId = setInterval(function () {
          moveElement(characterDiv, curDirection, characterSpeed, 'character')
        }, 1000 / fps)
      }
    } else if (key === 'c') { // If key is C
      if (boomerangsThrown < boomerangsPerLevel) {
        throwBoomerang()
      }
    }
  })

  // Releasing a key
  document.addEventListener('keyup', function (event) {
    // Get the key up released
    const key = event.key
    // Get the moving direction based on the key pressed
    let keyDirection
    if (key === 'ArrowLeft' || key === 'a') {
      keyDirection = 'left'
    } else if (key === 'ArrowRight' || key === 'd') {
      keyDirection = 'right'
    } else if (key === 'ArrowUp' || key === 'w') {
      keyDirection = 'up'
    } else if (key === 'ArrowDown' || key === 's') {
      keyDirection = 'down'
    }
    if (keyDirection === curDirection) {
      // Clear any existing interval moving the character
      clearInterval(charecterMovingIntervalId)
      // Update the current direction
      curDirection = 'none'
    }
  })

  // Corn div to clone
  const cornDiv = document.createElement('div')
  const cornImg = document.createElement('img')
  cornDiv.appendChild(cornImg)
  cornImg.src = './img/trash/corn.png'
  cornDiv.classList.add('corn')

  // Boomerang div to clone
  const boomerangDiv = document.createElement('div')
  const boomerangImg = document.createElement('img')
  boomerangDiv.appendChild(boomerangImg)
  boomerangImg.src = './img/trash/boomerang.png'
  boomerangDiv.classList.add('boomerang')

  // id for trash spawning interval
  let trashFallingIntervalId
  // array with id's for currently falling trash intervals
  let currentlyFallingTrashIntervalsIds = []

  // Level conditions
  let cornCount = 0
  const cornToWin = 7
  let speed = 3
  const speedAddPerLevel = 0.5
  const secondsBetweenLevels = 3
  let level = 1

  // Div with game info
  const gameInfoDiv = document.createElement('div')
  trashDiv.appendChild(gameInfoDiv)
  gameInfoDiv.id = 'info'
  // Div for current level
  const curLevelDiv = document.createElement('div')
  gameInfoDiv.appendChild(curLevelDiv)
  curLevelDiv.id = 'current-level'
  // Div for current corn/score
  const curCornDiv = document.createElement('div')
  gameInfoDiv.appendChild(curCornDiv)
  curCornDiv.id = 'current-corn'
  curCornDiv.innerHTML = 'Majskolvar: 0'

  // Start level 1
  startNextLevel()

  // FUNCTIONS
  //
  //
  //
  //
  //

  /**
   * Moves an HTMLElement with an interval.
   * @param {HTMLElement} element - The element to move.
   * @param {string} direction - The direction to move.
   * @param {number} length - Amount of pixels to move.
   * @param {string} itemType - Type of the item to move. 'character' or 'trash'.
   * @param {number} intervalId - The potential intervalId for the interval thats moves the HTMLElement in an interval.
   */
  function moveElement (element, direction, length, itemType, intervalId = 'notUsed') {
    const oldLeft = element.offsetLeft
    const oldTop = element.offsetTop
    let left = oldLeft
    let top = oldTop
    if (direction === 'left') {
      left = oldLeft - length
    } else if (direction === 'right') {
      left = oldLeft + length
    } else if (direction === 'up') {
      top = oldTop - length
    } else if (direction === 'down') {
      top = oldTop + length
    } else if (direction === 'upLeft') {
      top = oldTop - length
      left = oldLeft - length
    } else if (direction === 'upRight') {
      top = oldTop - length
      left = oldLeft + length
    } else if (direction === 'downLeft') {
      top = oldTop + length
      left = oldLeft - length
    } else if (direction === 'downRight') {
      top = oldTop + length
      left = oldLeft + length
    }
    // Make sure new position is valid
    if (left < 0) {
      left = 0
    } else if (left > 830) {
      left = 830
    }
    if (top < 0) {
      top = 0
    } else if (top > 530) {
      top = 530
    }
    // Update the position values that have been changed for the element
    if (left !== oldLeft) {
      element.style.left = left + 'px'
    }
    if (top !== oldTop) {
      element.style.top = top + 'px'
    }
    // If element wasn't moved
    if (left === oldLeft && top === oldTop) {
      if (itemType === 'trash') {
        // Remove the move interval for the trash item
        clearInterval(intervalId)
      } else if (itemType === 'boomerang') {
        // Remove the move interval for the boomerang
        clearInterval(intervalId)
        // Remove the boomerang
        element.remove()
      }
    }
    // Size of all the images, sort of. Their div have 70px width and height.
    const sizeDistance = 50
    // If item type is trash, check if the new position overlaps with the character or the boomerang
    if (itemType === 'trash') {
      // Get the position of the character
      const characterDiv = document.getElementById('character')
      const leftCharacter = characterDiv.offsetLeft
      const topCharacter = characterDiv.offsetTop
      // Check if the trash item and character overlap
      if (Math.abs(left - leftCharacter) < sizeDistance && Math.abs(top - topCharacter) < sizeDistance) {
        // Game over
        gameOver()
      }
      // Get the the boomerang div, if it exist
      const boomerangDivOnPage = document.querySelector('.boomerang')
      // If the boomerang div exist on the page
      if (boomerangDivOnPage) {
        const leftBoomerang = boomerangDivOnPage.offsetLeft
        const topBoomerang = boomerangDivOnPage.offsetTop
        // Check if the trash item and boomerang overlap
        if (Math.abs(left - leftBoomerang) < sizeDistance && Math.abs(top - topBoomerang) < sizeDistance) {
          console.log('boomerang hit trash')
          // Remove the trash item
          element.remove()
          // Remove the move interval for the trash item
          clearInterval(intervalId)
          // Remove the boomerang
          boomerangDivOnPage.remove()
          // Remove the move interval for the boomerang
          clearInterval(boomerangMovingIntervalId)
          // Add explosion effect
          const src = './animations/trash/lottie_explosion.json'
          addLottiePlayerElement(gameDiv, src, 1, 1, left, top, 'class', 'explosion-player')
        }
      }
    } else if (itemType === 'character') {
      // Get the two corn divs
      const cornDivs = document.querySelectorAll('.corn')
      for (const cornDiv of cornDivs) {
        const leftCorn = cornDiv.offsetLeft
        const topCorn = cornDiv.offsetTop
        // Check if the corn and character overlap
        if (Math.abs(left - leftCorn) < sizeDistance && Math.abs(top - topCorn) < sizeDistance) {
          // Remove the corn div
          cornDiv.remove()
          // Add score
          addScore()
          // Add star lottie player
          const src = './animations/trash/lottie_star.json'
          addLottiePlayerElement(gameDiv, src, 1, 1, left, top, 'class', 'star-player')
        }
      }
    }
  }

  /**
   * Makes trash items/divs spawn at the top of the specified div and moves to the bottom.
   * @param {HTMLElement} parentDiv - The div to spawn the trash item div in.
   * @param {number} speed - Pixels to move the trash item div down every time it moves down.
   * @param {number} fps - Times per seconds the trash item div moves down.
   */
  function trashFalling (parentDiv, speed, fps) {
    console.log('starting trashFalling with speed:' + speed)
    const trashItems = [
      'apple.png',
      'can.png',
      'trashbag.png',
      'banana.png',
      'fishbone.png'
    ]
    // Index for next item to spawn
    let indexNextItem = 0
    // Time in seconds between each item spawning
    const spawnIntervalSeconds = 1.7 / (speed / 3)

    // Interval for spawning new trash items
    trashFallingIntervalId = setInterval(function () {
      // Div for the trash item
      const trashItemDiv = document.createElement('div')
      parentDiv.appendChild(trashItemDiv)
      trashItemDiv.classList.add('trash-item')
      // Img
      const trashImg = document.createElement('img')
      trashItemDiv.appendChild(trashImg)
      trashImg.src = './img/trash/' + trashItems[indexNextItem]
      // Randomize the spawn location of the trash item
      const left = Math.floor(Math.random() * 831)
      trashItemDiv.style.left = left + 'px'
      // Make the trash item fall
      const thisTrashItemFallingIntervalId = setInterval(function () {
        moveElement(trashItemDiv, 'down', speed, 'trash', thisTrashItemFallingIntervalId)
      }, 1000 / fps)
      // Add the inteval id to the array
      currentlyFallingTrashIntervalsIds.push(thisTrashItemFallingIntervalId)
      // Update the index for the next trash item to spawn
      indexNextItem = (indexNextItem + 1) % trashItems.length
    }, 1000 * spawnIntervalSeconds)
  }

  /**
   * Removes all trash item divs and corn divs.
   */
  function clearTrash () {
    const trashItemDivs = document.querySelectorAll('.trash-item')
    trashItemDivs.forEach(element => {
      element.remove()
    })
    const cornDivs = document.querySelectorAll('.corn')
    cornDivs.forEach(element => {
      element.remove()
    })
  }

  /**
   * Adds a corn div at a random position.
   * @param {HTMLElement} parentDiv - The div to add the corn div in.
   * @param {HTMLElement} cornDiv - A corn div template to clone.
   */
  function addCorn (parentDiv, cornDiv) {
    // Clone the div
    const cloneDiv = cornDiv.cloneNode(true)
    parentDiv.appendChild(cloneDiv)
    // Randomize position for the new div
    const leftMax = 800
    const topMin = 130
    const topMax = 500
    const left = Math.floor(Math.random() * leftMax)
    const top = Math.floor(Math.random() * (topMax - topMin) + topMin)
    cloneDiv.style.left = left + 'px'
    cloneDiv.style.top = top + 'px'
  }

  /**
   * Increments the score/cornCount by 1. Then checks if a new corn div should spawn or start next level.
   */
  function addScore () {
    cornCount++
    if (cornCount === cornToWin) {
      startNextLevel()
    } else {
      // Add new corn
      addCorn(gameDiv, cornDiv)
    }
    // Update corn/score counter display
    curCornDiv.innerHTML = 'Majskolvar: ' + cornCount
  }

  /**
   * Ends the game. Adds a game over div in the middle of the game div.
   */
  function gameOver () {
    console.log('GAME OVER!')
    // End the game
    // Stop spawning trash
    clearInterval(trashFallingIntervalId)
    // Remove the ongoing intervals for the trash items
    clearTrashIntervals()
    // Remove all content of the game div
    gameDiv.innerHTML = ''
    // Show game over banner
    const gameOverDiv = document.createElement('div')
    gameDiv.appendChild(gameOverDiv)
    gameOverDiv.id = 'game-over'
    gameOverDiv.innerHTML = 'GAME OVER'
    // Show new game banner
    const newGameButton = document.createElement('button')
    gameOverDiv.appendChild(newGameButton)
    newGameButton.id = 'start-trash'
    newGameButton.innerHTML = 'Starta om'
    // Show the cursor
    showCursor()
    // When clicking new gam button
    newGameButton.addEventListener('click', function () {
      // Remove the game over div
      gameOverDiv.remove()
      // Remove the info div (level and corn/score)
      document.getElementById('info').remove()
      // Start a new game
      trashGame(trashDiv, gameDiv)
    })
  }

  /**
   * Starts the next level.
   */
  function startNextLevel () {
    console.log('starting level: ' + level)
    if (level > 1) {
      // Reset corn counter
      cornCount = 0
      // Stop trash from falling
      clearInterval(trashFallingIntervalId)
      // Clear trash
      clearTrash()
      // Remove the intervals from the trash item
      clearTrashIntervals()
      // Update speed
      speed += speedAddPerLevel
      // Reset boomerangs thrown counter
      boomerangsThrown = 0
    }
    // Show new level banner
    const newLevelDiv = document.createElement('div')
    gameDiv.appendChild(newLevelDiv)
    newLevelDiv.id = 'new-level'
    newLevelDiv.innerHTML = 'Level ' + level
    // Start next level
    setTimeout(() => {
      // Remove the new level banner
      newLevelDiv.remove()
      // Make trash fall
      trashFalling(gameDiv, speed, fps)
      // Spawn two corn
      addCorn(gameDiv, cornDiv)
      addCorn(gameDiv, cornDiv)
    }, 1000 * secondsBetweenLevels)
    // Add current level to the current level div
    curLevelDiv.innerHTML = 'Level: ' + level
    // Update level counter
    level++
  }

  /**
   * Removes all intervals for all trash item divs.
   */
  function clearTrashIntervals () {
    // Remove the interval for each id
    for (const intervalId of currentlyFallingTrashIntervalsIds) {
      clearInterval(intervalId)
      console.log('removed interval id : ' + intervalId)
    }
    // Remove the id's from the array
    currentlyFallingTrashIntervalsIds = []
  }

  /**
   * Throw a boomerang in the character moving direction.
   */
  function throwBoomerang () {
    // Clone the boomerang template div
    const cloneDiv = boomerangDiv.cloneNode(true)
    gameDiv.appendChild(cloneDiv)
    // Set the position for the boomerang div
    cloneDiv.style.left = characterDiv.offsetLeft + 'px'
    cloneDiv.style.top = characterDiv.offsetTop + 'px'
    // Boomerang direction
    const boomerangDirection = latestCharacterDirection
    // Interval that moves the boomerang
    boomerangMovingIntervalId = setInterval(function () {
      moveElement(cloneDiv, boomerangDirection, boomerangSpeed, 'boomerang', boomerangMovingIntervalId)
    }, 1000 / fps)
    // Increment boomerangs thrown this level by 1
    boomerangsThrown++
  }

  /**
   * Creates a div with a dotlottie-player element and adds the div to 'parentElement' for a specified time.
   * @param {HTMLElement} parentElement - The parent element.
   * @param {string} src - The source of the .json file.
   * @param {number} speed - The speed of the lottie player. 1 for normal speed.
   * @param {number} secOnScreen - Seconds to show the lottie player on the screen.
   * @param {number} left - Pixels from the left border of the parent element.
   * @param {number} top - Pixels from the top border of the parent element.
   * @param {string} addIdOrClass - Whether to give the lottie player an id or class.
   * @param {string} idClass - Id or class name.
   * @returns {HTMLElement} - The created div.
   */
  function addLottiePlayerElement (parentElement, src, speed, secOnScreen, left, top, addIdOrClass = 'class', idClass) {
    // Create a div for the lottie player
    const lottiePlayerDiv = document.createElement('div')
    // Append the div to it's parent element
    parentElement.appendChild(lottiePlayerDiv)
    // Create a dotlottie-player element
    const lottiePlayer = document.createElement('dotlottie-player')
    // Append the lottie player to the div
    lottiePlayerDiv.appendChild(lottiePlayer)
    // Set attributes for the player
    lottiePlayer.setAttribute('src', src)
    lottiePlayer.setAttribute('speed', speed)
    lottiePlayer.setAttribute('autoplay', '')
    // Set the position of the div
    lottiePlayerDiv.style.left = left + 'px'
    lottiePlayerDiv.style.top = top + 'px'
    // Give the div an id or a class
    if (addIdOrClass === 'id') {
      lottiePlayerDiv.id = idClass
    } else if (addIdOrClass === 'class') {
      console.log(idClass)
      lottiePlayerDiv.classList.add(idClass)
    }
    // Timeout to remove the div
    setTimeout(() => {
      // Add class to make smooth outh transition
      lottiePlayerDiv.classList.add('remove-animation')
      // Seconds for smooth out remove transition (can be higher than actual transition time)
      const secTransition = 1
      setTimeout(() => {
        lottiePlayerDiv.remove()
      }, 1000 * secTransition)
    }, 1000 * secOnScreen)
    console.log('created a lottie player')
    return lottiePlayerDiv
  }

  function addWindLottiePlayerElement () {
    // Show the animation
    const src = './animations/trash/lottie_wind.json'
    const left = characterDiv.offsetLeft
    const top = characterDiv.offsetTop
    const lottiePlayerDiv = addLottiePlayerElement(gameDiv, src, 1, 200, left, top, 'class', 'lottie-player')
    lottiePlayerDiv.classList.add('wind-player')
    // Set the angle of the animation
    if (curDirection === 'up') {
      lottiePlayerDiv.style.transform = 'rotate(90deg)'
    } else if (curDirection === 'right') {
      lottiePlayerDiv.style.transform = 'rotate(180deg)'
    } else if (curDirection === 'down') {
      lottiePlayerDiv.style.transform = 'rotate(-90deg)'
    }
  }

  /**
   * Hides the cursor in the body.
   */
  function hideCursor () {
    document.body.style.cursor = 'none'
  }

  /**
   * Shows the cursor in the body, like default.
   */
  function showCursor () {
    document.body.style.cursor = 'default'
  }

//   // For testing speed (showcasing trash items speed)
//   let lefty = 0
//   let fpsy = 50
// 
//   const spawny = setInterval(() => {
//     // Remove the char div
//     characterDiv.remove()
//     // Div for the trash item
//     const trashItemDiv = document.createElement('div')
//     gameDiv.appendChild(trashItemDiv)
//     trashItemDiv.classList.add('trash-item')
//     // Img
//     const trashImg = document.createElement('img')
//     trashItemDiv.appendChild(trashImg)
//     trashImg.src = './img/trash/can.png'
//     // Set the spawn location of the trash item
//     trashItemDiv.style.left = lefty + 'px'
// 
//     // Give it id
//     trashItemDiv.id = fpsy
//     lefty+= 10
//     // Make the trash item fall
//     const thisTrashItemFallingIntervalId = setInterval(function () {
//       moveElement(trashItemDiv, 'down', speed, 'trash', thisTrashItemFallingIntervalId)
//     }, 1000 / fpsy)
//     fpsy += 2
//     console.log(lefty)
//     if (lefty >= 830) {
//       clearInterval(spawny)
//     }
//   }, 1000 / 800);
}
