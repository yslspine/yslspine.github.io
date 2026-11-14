/*
  PEOPLE
  One block per student. To add someone, copy a block and change the text.

  name      as it should appear
  role      one line, e.g. "MD candidate, class of 2028"
  photo     path to a portrait in assets/img/people (4:5 upright crop works best),
            or "" to show a plain placeholder
  blurb     one or two sentences
  projects  ids from content/projects.js; each becomes a link to that note
*/
window.PEOPLE = {

  students: [
    {
      name: "[[Student name]]",
      role: "[[MD candidate, class of 2028]]",
      photo: "",
      blurb: "[[One or two sentences: what they work on in the group and what they are aiming for.]]",
      projects: ["neck-tilt-pseudarthrosis"]
    },
    {
      name: "[[Student name]]",
      role: "[[MD candidate, class of 2029]]",
      photo: "",
      blurb: "[[One or two sentences: what they work on in the group and what they are aiming for.]]",
      projects: ["c7-to-t1-converter"]
    },
    {
      name: "[[Student name]]",
      role: "[[Research year student]]",
      photo: "",
      blurb: "[[One or two sentences: what they work on in the group and what they are aiming for.]]",
      projects: ["predicted-vs-measured-lordosis"]
    },
    {
      name: "[[Student name]]",
      role: "[[Undergraduate summer student]]",
      photo: "",
      blurb: "[[One or two sentences: what they work on in the group and what they are aiming for.]]",
      projects: []
    }
  ],

  // Former members. Leave the list empty to hide the section.
  //   { name: "Name", note: "MD 2026, now orthopaedic surgery resident at ..." }
  alumni: []
};
