/*
  Sermon series for the Sermons page.
  Put the newest series first, and the newest sermon first inside it.
  The page also sorts by date, so a sermon added at the top stays at the top.

  To add a sermon, copy a sermon block and put it first in the current series.
  To start a series, copy a series block and put it first in SERIES.

  Series fields:
    title      Series name
    summary    What the series is about (optional)
    sermons    The messages in that series

  Sermon fields:
    title      Sermon title
    date       "YYYY-MM-DD", or "M/D/YYYY"
    scripture  Main passage (optional)
    summary    One or two sentences (optional, shown on the latest sermon)
    video      YouTube link, or paste the whole YouTube <iframe> embed code
               (YouTube > Share > Embed). A start= or t= value starts playback
               at that second. Facebook links still work too.
    aspect     "9 / 16" for a vertical video (optional; landscape is the default)
*/

window.SERIES = [
  {
    title: "This Is Who We Are",
    summary: "",
    sermons: [
      {
        title: "Part 5: Healthy Leader, Healthy Church",
        date: "11/8/2026",
        scripture: "2 Samuel 2:12",
        summary: "",
        video: "https://www.youtube.com/embed/Ar7RNxxg60o",
      },
      {
        title: "Part 4: The Meaning of Communion",
        date: "11/1/2026",
        scripture: "Matthew 3:4-17, Matthew 26:26-30",
        summary: "Learn more about why we partake of the holy communion, and why we practice baptism by water, as Jesus did.",
        video: "https://www.youtube.com/embed/MJTFzNTy2AE",
      },
      {
        title: "Part 3: We Need Each Other",
        date: "10/25/2026",
        scripture: "Mark 2:1-12",
        summary: "",
        video: "https://www.youtube.com/embed/Yv1e1dDXmdI",
      },
      {
        title: "Part 2: The Authority of Scripture",
        date: "10/18/2026",
        scripture: "Hebrews 4:12",
        summary: "",
        video: "https://www.youtube.com/embed/QM_tl0slUvA",
      },
      {
        title: "Part 1: Jesus Is Lord",
        date: "10/11/2026",
        scripture: "",
        summary: "",
        video: "https://www.youtube.com/embed/fchQL-_32ME",
      },
    ],
  },
];
