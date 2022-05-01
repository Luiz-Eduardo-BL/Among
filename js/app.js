app = {

  computerCombination: [],
  playerCombination: [],
  computerCombinationPosition: 1,
  combinationMaxPosition: 5,
  memoryMaxCombination: 9,

  audio: {
      start: 'start.mp3',
      fail: 'fail.mp3',
      complete: 'complete.mp3',
      combinations: ['0.mp3', '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3'],
      
      loadAudio(filename) {

          const file = `./audio/${filename}?cb=${new Date().getTime()}`
          const audio = new Audio(file)
          audio.load()
          return audio

      },

      loadAudios() {

          if (typeof(app.audio.start) == "object") return

          app.audio.start = app.audio.loadAudio(app.audio.start)
          app.audio.complete = app.audio.loadAudio(app.audio.complete)
          app.audio.fail = app.audio.loadAudio(app.audio.fail)
          app.audio.combinations = app.audio.combinations.map ( (audio) => app.audio.loadAudio(audio))

      }
      

  },
  interface: {

      memoryPanel: document.querySelector(".painelMemory"),
      computerLedPanel: document.querySelector(".computerLedPanel"),
      playerLedPanel: document.querySelector(".playerLedPanel"),
      playerMemory: document.querySelector(".playerMemory"),
      playerMemoryButtons: document.getElementsByClassName("player_memory"),

      turnLedOn(index, ledPanel) {
          ledPanel.children[index].classList.add("ledOn");
      },

      turnAllLedsOff() {
          
          const computerLedPanel = app.interface.computerLedPanel
          const playerLedPanel = app.interface.playerLedPanel

          for (var i = 0; i < computerLedPanel.children.length; i++) {
              computerLedPanel.children[i].classList.remove("ledOn");
              playerLedPanel.children[i].classList.remove("ledOn");
          }

      },

      async start() {
          return app.audio.start.play()
      },

      playItem(index, combinationPosition, location = 'computer') {
          
          const leds = (location == 'computer') ? app.interface.computerLedPanel : app.interface.playerLedPanel
          const memPanel = app.interface.memoryPanel.children[index]

          memPanel.classList.add("memoryActive")
          app.interface.turnLedOn(combinationPosition, leds)
          app.audio.combinations[index].play().then(() => {
              setTimeout(() => {
                  memPanel.classList.remove("memoryActive")
              }, 150)
          })
      },

      endGame(type = "fail") {
          
          const memPanel = app.interface.memoryPanel
          const ledPanel = app.interface.computerLedPanel
          const audio = (type == "complete") ? app.audio.complete : app.audio.fail
          const typeClasses = (type == "complete") ? ["playerMemoryComplete", "playerLedComplete"] : ["playerMemoryError", "playerLedError"]

          app.interface.disableButtons()
          app.interface.turnAllLedsOff()

          audio.play().then(() => {

              for (var i = 0; i < memPanel.children.length; i++) {
                  if (memPanel.children[i].tagName == "DIV")
                      memPanel.children[i].classList.add(typeClasses[0])
              }
              for (var i = 0; i < ledPanel.children.length; i++) {
                  if (ledPanel.children[i].tagName == "DIV")
                      ledPanel.children[i].classList.add(typeClasses[1])
              }
              setTimeout(() => {
                  for (var i = 0; i < memPanel.children.length; i++) {
                  if (memPanel.children[i].tagName == "DIV")
                      memPanel.children[i].classList.remove(typeClasses[0])
                  }
                  for (var i = 0; i < ledPanel.children.length; i++) {
                  if (ledPanel.children[i].tagName == "DIV")
                      ledPanel.children[i].classList.remove(typeClasses[1])
                  }
              }, 900);

          })

      },

      enableButtons() {

          const playerMemory = app.interface.playerMemory
          playerMemory.classList.add('playerActive')

          for (var i = 0; i < playerMemory.children.length; i++) {
              if (playerMemory.children[i].tagName == "DIV")
                  playerMemory.children[i].classList.add("playerMemoryActive")
          }

      },

      disableButtons() { 

          const playerMemory = app.interface.playerMemory
          playerMemory.classList.remove('playerActive')

          for (var i = 0; i < playerMemory.children.length; i++) {
          if (playerMemory.children[i].tagName == "DIV")
              playerMemory.children[i].classList.remove("playerMemoryActive");
          }

      },
      

  },

  async load() {
      return new Promise(resolve => {
          console.log("Loading Game...")
          app.audio.loadAudios()

          const playerMemory  = app.interface.playerMemory
          const memory = app.interface.playerMemoryButtons
          
          Array.prototype.forEach.call(memory, (element) => {

              element.addEventListener("click", () => {
              if (playerMemory.classList.contains("playerActive")) {
                  app.play(parseInt(element.dataset.memory))
                  console.log("O valor do elemento clicado é: " + element.dataset.memory)

                  element.style.animation = "playermemoryClick .4s"
                  setTimeout(() => element.style.animation = "", 400)
              }
              })  

          })
      })


   },
  start() {

      app.computerCombination = app.createCombination()
      app.computerCombinationPosition = 1
      app.playerCombination = []
      app.interface.start().then(() => {
          setTimeout(() => {
              app.playCombination()
          }, 500)
      })

  },
  
  createCombination() {

      let newCombination = []
      for (let n = 0; n < app.combinationMaxPosition; n++){
          const position = Math.floor((Math.random() * app.memoryMaxCombination) + 1)
          newCombination.push(position-1)
      }
      return newCombination

  },

  play(index) {

      app.interface.playItem(index, app.playerCombination.length, 'player')
      app.playerCombination.push(index)

      if (app.isTheRightCombination(app.playerCombination.length)) {
          
          if (app.playerCombination.length == app.combinationMaxPosition) {
              app.interface.endGame("complete")
              setTimeout(() => {
                  app.start()
              }, 1200)
              return
          }

          if (app.playerCombination.length == app.computerCombinationPosition) {
              app.computerCombinationPosition++
              setTimeout(() => {
                      app.playCombination()
              }, 1200)
              return
          }

      } else {

          app.interface.endGame("fail")
          document.getElementById("title").textContent = "Você é o impostor"
          setTimeout(() => {
              document.getElementById("title").textContent = "START REACTOR"
              app.start()
          }, 1400)
          return
      }
  },

  playCombination() {

      app.playerCombination = []
      app.interface.disableButtons()
      app.interface.turnAllLedsOff()

      for (let i = 0; i <= app.computerCombinationPosition - 1; i++){

          setTimeout(() => {
              app.interface.playItem(app.computerCombination[i], i)
          }, 400 * (i+1))
      }

      setTimeout(() => {
          app.interface.turnAllLedsOff()
          app.interface.enableButtons()
      }, 600 * app.computerCombinationPosition)

   },
  
  isTheRightCombination(position) {
      
      let computerCombination = app.computerCombination.slice(0, position)
      return ( computerCombination.toString() == app.playerCombination.toString())

  },

}