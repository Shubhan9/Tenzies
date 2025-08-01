export default function Leaderboard(props) {

  function formatTime(seconds){
        let mins=Math.floor(seconds/60)
        let secs=(seconds%60)
        let paddedMins=mins.toString().padStart(2,"0")
        let paddingSecs=secs.toString().padStart(2,"0")
        return `${paddedMins}:${paddingSecs}`
    }

  return (
    <aside className="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        {props.topScores.map((score, idx) => (
          <li key={idx}>
            <span className="score-time">{formatTime(score.time)}</span>
            <span className="score-rolls">({score.rolls} rolls)</span>
            </li>
        ))}
      </ol>
    </aside>
  )
}
