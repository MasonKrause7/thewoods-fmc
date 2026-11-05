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
    video      Facebook video link, or paste the whole Facebook <iframe> embed code.
               A t= value in the embed (t=20) starts playback at that second.
    aspect     "9 / 16" for a vertical video (optional; landscape is the default)
*/

window.SERIES = [
  {
    title: "This Is Who We Are",
    summary: "",
    sermons: [
      {
        title: "The Meaning of Communion",
        date: "11/1/2026",
        scripture: "Matthew 3:4-17, Matthew 26:26-30",
        summary: "Learn more about why we partake of the holy communion, and why we practice baptism by water, as Jesus did.",
        video: `<iframe src="https://www.facebook.com/plugins/video.php?height=311&href=https%3A%2F%2Fwww.facebook.com%2F100081895544129%2Fvideos%2F1081052084912479%2F&show_text=false&width=560&t=20" width="560" height="311" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`,
      },
      {
        title: "Sunday Message",
        date: "10/25/2026",
        scripture: "",
        summary: "",
        video: "https://www.facebook.com/100081895544129/videos/1419285730419829/",
      },
      {
        title: "Sunday Message",
        date: "10/18/2026",
        scripture: "",
        summary: "",
        video: "https://www.facebook.com/100081895544129/videos/2231419730740480/",
      },
      {
        title: "Sunday Message",
        date: "10/11/2026",
        scripture: "",
        summary: "",
        video: "https://www.facebook.com/100081895544129/videos/1139402158423825/",
      },
    ],
  },
];
