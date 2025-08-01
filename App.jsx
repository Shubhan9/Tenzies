import { useState, useRef, useEffect } from "react"
import Die from "./Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"
import Leaderboard from "./Leaderboard.jsx"

export default function App() {
    const [dice, setDice] = useState(() => generateAllNewDice())
    const [rollCount,setRollCount]=useState(0)
    const [time,setTime]=useState(0)
    const [isRunning,setIsRunning]=useState(false)
    const [bestTime,setBestTime]=useState(null)
    const buttonRef = useRef(null)
    const [topScores, setTopScores] = useState([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("topScores")) || []
        setTopScores(stored)
    }, [])

    const gameWon = dice.every(die => die.isHeld) &&
        dice.every(die => die.value === dice[0].value)
    
    useEffect(() => {
        if (gameWon) {
            if(bestTime==null || time<bestTime){
                setBestTime(time)
                localStorage.setItem("bestTime",formatTime(time))
            }
            
            const newScore = {
                time: time,
                rolls: rollCount,
                timestamp: Date.now() 
            }
            const prevScores = JSON.parse(localStorage.getItem("topScores")) || []

            const alreadyExists = prevScores.some(score =>
            score.time === newScore.time &&
            score.rolls === newScore.rolls &&
            Math.abs(score.timestamp - newScore.timestamp) < 1000 // Allow 1 sec margin
            )
            // Sort by time first, then by rolls if time is equal
            const newScores = alreadyExists?prevScores:
            [...prevScores, newScore]
                .sort((a, b) => {
                    if (a.time === b.time) {
                        return a.rolls - b.rolls // 
                    }
                    return a.time - b.time // Primary sort by time
                })
                .slice(0, 10)
            
            localStorage.setItem("topScores", JSON.stringify(newScores))
            setTopScores(newScores)
            
            buttonRef.current.focus()
            setIsRunning(false)
        }
    }, [gameWon, time, rollCount, bestTime])

    useEffect(()=>{
        let intervalId
        if (isRunning){
            intervalId=setInterval(()=>{
                setTime(prevTime=>prevTime+1)
            },1000)
            return ()=>clearInterval(intervalId)
        }
    },[isRunning])

    useEffect(() => {
    const storedTime = localStorage.getItem("bestTime")
    if (storedTime) setBestTime(Number(storedTime))
    }, [])


    function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid()
            }))
    }
    
    function rollDice() {
        if(!isRunning && !gameWon){
            setIsRunning(true)
        }
        if (!gameWon) {
            setDice(oldDice => oldDice.map(die =>
                die.isHeld ?
                    die :
                    { ...die, value: Math.ceil(Math.random() * 6) }
            ))
            setRollCount(prevCount=>prevCount+1)
        } else {
            setDice(generateAllNewDice())
            setRollCount(0)
            setTime(0)
        }
    }
    function formatTime(seconds){
        let mins=Math.floor(seconds/60)
        let secs=(seconds%60)
        let paddedMins=mins.toString().padStart(2,"0")
        let paddingSecs=secs.toString().padStart(2,"0")
        return `${paddedMins}:${paddingSecs}`
    }
    function hold(id) {
        if(!isRunning && rollCount==0){
            setIsRunning(true)
        }
        setDice(oldDice => oldDice.map(die =>
            die.id === id ?
                { ...die, isHeld: !die.isHeld } :
                die
        ))
    }

    const diceElements = dice.map(dieObj => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
        />
    ))

    return (
        <div className="app-layout">
        <main>
            {gameWon && <Confetti />}
            <div aria-live="polite" className="sr-only">
                {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            </div>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
                {gameWon ? "New Game" : "Roll"}
            </button >
            <div className="stats">
            <p>Rolls : {rollCount}</p>
            <p>Time : {formatTime(time)}</p>
            </div>
            {/* <p>Time to beat : {bestTime?formatTime(bestTime):`00:00`}    </p> */}
        </main>
        <Leaderboard  topScores={topScores}/>
        </div>
    )
}