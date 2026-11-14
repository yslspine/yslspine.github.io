/*
  PROJECT BOARD
  One block per sticky note. To add a project, copy a block, change the text,
  and give it a new id (lowercase letters, digits and hyphens only).

  id          used in links: .../#project-<id>
  title       full title, shown on the note and in the opened sheet
  short       short name, used on the People page next to a student
  blurb       two sentences at most; this is what fits on the note
  question    optional; the research question, shown when the note is opened
  details     optional; "what you would do" bullet points
  kind        study type, shown at the foot of the note
  area        notes can be filtered by area
  status      "open" or "filled"
  prospectus  path to the 2-page PDF in the prospectuses folder, or "" if none yet
  color       "yellow", "rose", "sky" or "mint" (leave out to cycle automatically)
*/
window.PROJECTS = [

  {
    id: "neck-tilt-pseudarthrosis",
    title: "The impact of neck tilt in cervical pseudarthrosis after fusion",
    short: "Neck tilt and pseudarthrosis",
    blurb: "Cervical fusions that fail to unite mostly fail at the lowest level. Neck tilt describes the lever arm acting there, and nobody has tested it against fusion status.",
    question: "In patients followed for at least a year after anterior or posterior cervical fusion, is preoperative neck tilt associated with pseudarthrosis?",
    details: [
      "Find out how often the sternal notch and the T1 endplate are both visible on preoperative lateral films and on CT.",
      "Measure neck tilt, T1 slope and thoracic inlet angle alongside a second reader, and report how well the two readers agree.",
      "Build a retrospective cohort analysis suitable for an abstract and a manuscript."
    ],
    kind: "Retrospective cohort",
    area: "Fusion outcomes",
    status: "open",
    prospectus: "prospectuses/neck-tilt-pseudarthrosis.pdf"
  },

  // {
  //   id: "c7-to-t1-converter",
  //   title: "Estimating T1 slope when T1 is out of view",
  //   short: "C7-to-T1 converter",
  //   blurb: "T1 can be seen on only about a third of lateral cervical films. Can C7 slope stand in for it once age, sex and morphology are accounted for?",
  //   question: "Can T1 slope be estimated from C7 slope, with age-, sex- and morphology-specific offsets, to within measurement error?",
  //   kind: "Radiographic measurement",
  //   area: "Measurement",
  //   status: "open",
  //   prospectus: ""
  // },

  // {
  //   id: "t1-slope-repeatability",
  //   title: "How much of a change in T1 slope is real?",
  //   short: "T1 slope repeatability",
  //   blurb: "T1 slope shifts by several degrees with arm position, sitting and lying down. This project pins down its repeatability across positions and readers.",
  //   question: "What is the minimal detectable change of T1 slope, and how large are the offsets between standing, sitting and supine imaging?",
  //   kind: "Measurement study",
  //   area: "Measurement",
  //   status: "open",
  //   prospectus: ""
  // },

  // {
  //   id: "t1-slope-fusion-endpoint",
  //   title: "T1 slope and where a posterior cervical fusion should stop",
  //   short: "T1 slope and the lowest fused level",
  //   blurb: "Does a steep T1 slope change the result of ending a posterior fusion at C7 rather than crossing into the upper thoracic spine?",
  //   question: "Does T1 slope modify the effect of stopping at C7 versus crossing to T1 or T2 on revision after posterior cervical fusion?",
  //   kind: "Retrospective cohort",
  //   area: "Fusion outcomes",
  //   status: "open",
  //   prospectus: ""
  // },

  // {
  //   id: "predicted-vs-measured-lordosis",
  //   title: "Predicted versus measured cervical lordosis on full-length standing films",
  //   short: "Predicted vs measured lordosis",
  //   blurb: "Published formulas predict how much lordosis a neck should have. We test whether the gap between predicted and measured lordosis tracks forward head position.",
  //   question: "Does the difference between measured and formula-predicted cervical lordosis track the C2 to C7 sagittal vertical axis or disability scores?",
  //   kind: "Radiographic measurement",
  //   area: "Posture and alignment",
  //   status: "open",
  //   prospectus: ""
  // },

  {
    id: "nonoperative-t1-slope",
    title: "Does anything short of surgery change T1 slope?",
    short: "Non-operative change in T1 slope",
    blurb: "Traction, extensor strengthening and exercise aimed at thoracic kyphosis are all said to improve posture. Does any of them move standing T1 slope, and does it last?",
    question: "Do cervical traction, extensor strengthening or thoracic-kyphosis-directed exercise change standing T1 slope, and does the change persist?",
    kind: "Literature review",
    area: "Posture and alignment",
    status: "open",
    prospectus: "prospectuses/nonoperative.pdf"
  },

  // {
  //   id: "t1-slope-reporting-standard",
  //   title: "A reporting standard for T1 slope studies",
  //   short: "Reporting standard",
  //   blurb: "Papers on T1 slope differ in patient position, imaging and landmarks, so their numbers are hard to compare. A structured review to propose what every study should report.",
  //   kind: "Structured review",
  //   area: "Measurement",
  //   status: "open",
  //   prospectus: ""
  // }

];
