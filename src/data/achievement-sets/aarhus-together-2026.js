/** Aarhus Together: unlocks as unique beers are tasted / checked in. */
export default {
  metric: "tasted",
  items: [
    {
      count: 5,
      name: "First Five Triumph",
      title: "First Five Triumph",
      subtitle: "You have tasted five unique beers!",
      description:
        "That first flight always feels special. Keep discovering new brews to unveil the next surprise.",
      image: `${import.meta.env.BASE_URL}achievements/aarhus-together/drunk5.jpeg`,
    },
    {
      count: 10,
      name: "Tenacious Ten",
      title: "Tenacious Ten",
      subtitle: "Ten beers sampled with style!",
      description: "Double digits unlocked. Your palate is officially warmed up and ready for the next round.",
      image: `${import.meta.env.BASE_URL}achievements/aarhus-together/drunk10.jpeg`,
    },
    {
      count: 15,
      name: "Fifteen Flavor Explorer",
      title: "Fifteen Flavor Explorer",
      subtitle: "Fifteen beers explored!",
      description: "You are charting new territory in the beer map of Aarhus. The adventure continues.",
      image: `${import.meta.env.BASE_URL}achievements/aarhus-together/drunk15.jpeg`,
    },
    {
      count: 20,
      name: "Twenty Tap Conqueror",
      title: "Twenty Tap Conqueror",
      subtitle: "Twenty beers down the hatch!",
      description: "You have conquered twenty taps. Only the bold reach this far—one more milestone remains.",
      image: `${import.meta.env.BASE_URL}achievements/aarhus-together/drunk20.jpeg`,
    },
    {
      count: 25,
      name: "Quarter Century Legend",
      title: "Quarter Century Legend",
      subtitle: "Twenty-five beers enjoyed!",
      description: "What a journey! You have unlocked every achievement and earned legendary status.",
      image: `${import.meta.env.BASE_URL}achievements/aarhus-together/drunk25.jpeg`,
    },
  ],
};
