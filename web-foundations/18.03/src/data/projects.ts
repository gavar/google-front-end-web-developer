import {Disney, GameInsight, Konsus, SafetyWing, TSG} from "./companies";
import {
    AWSLambda, CSharp, Gulp, Java, Jenkins, JIRA, Maven, MySQL, NodeJS, Serverless, Spring, TypeScript,
    Handlebars, Unity3D, JavaScript, React, Webpack
} from "./technologies";
import {Project} from "./types";

export const Fronted: Project = {
    title: "Fronted",
    url: "http://fronted.com/",
    dateFrom: new Date(2017, 3),
    dateTo: new Date(),
    company: SafetyWing,
    role: "Backend Developer",
    technologies: [Java, Spring, MySQL, Maven, NodeJS, TypeScript, Handlebars, Gulp],
    post: {
        gallery: {
            boxType: "phone",
            items: [{
                type: "image",
                href: "https://placeimg.com/225/400/tech"
            }]
        },
        content: `<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis. Sit amet justo donec enim diam vulputate ut pharetra. Sed cras ornare arcu dui. Pulvinar pellentesque habitant morbi tristique senectus. Sit amet consectetur adipiscing elit ut. Sed egestas egestas fringilla phasellus faucibus. Ut aliquam purus sit amet luctus. Sem integer vitae justo eget magna. Quis vel eros donec ac odio tempor. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Mi proin sed libero enim sed faucibus turpis in. Scelerisque eleifend donec pretium vulputate.
</p>`,
    }
};

export const MyCountryAR: Project = {
    title: "My Country",
    url: "http://www.game-insight.com/games/my-country",
    dateFrom: new Date(2017, 9),
    dateTo: new Date(2017, 10),
    role: "Developer / Tech Lead",
    company: GameInsight,
    technologies: [Unity3D, CSharp, Java, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            items: [{
                type: "image",
                href: "https://placeimg.com/225/400/tech"
            }]
        },
        content: `<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis. Sit amet justo donec enim diam vulputate ut pharetra. Sed cras ornare arcu dui. Pulvinar pellentesque habitant morbi tristique senectus. Sit amet consectetur adipiscing elit ut. Sed egestas egestas fringilla phasellus faucibus. Ut aliquam purus sit amet luctus. Sem integer vitae justo eget magna. Quis vel eros donec ac odio tempor. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Mi proin sed libero enim sed faucibus turpis in. Scelerisque eleifend donec pretium vulputate.
</p>`,
    }
};

export const Moana: Project = {
    title: "Moana Island Life",
    url: "http://www.game-insight.com/en/games/moana",
    dateFrom: new Date(2017, 3),
    dateTo: new Date(2017, 9),
    company: [GameInsight, Disney],
    role: "Developer / Tech Lead",
    technologies: [Unity3D, CSharp, Java, TypeScript, AWSLambda, Serverless, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            items: [{
                type: "image",
                href: "https://placeimg.com/225/400/tech"
            }]
        },
        content: `<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis. Sit amet justo donec enim diam vulputate ut pharetra. Sed cras ornare arcu dui. Pulvinar pellentesque habitant morbi tristique senectus. Sit amet consectetur adipiscing elit ut. Sed egestas egestas fringilla phasellus faucibus. Ut aliquam purus sit amet luctus. Sem integer vitae justo eget magna. Quis vel eros donec ac odio tempor. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Mi proin sed libero enim sed faucibus turpis in. Scelerisque eleifend donec pretium vulputate.
</p>`,
    }
};

export const KonsusProject: Project = {
    title: "Konsus",
    url: "https://www.konsus.com/",
    dateFrom: new Date(2016, 3),
    dateTo: new Date(2016, 10),
    company: Konsus,
    role: "Full Stack Web Developer",
    technologies: [Java, Spring, JavaScript, TypeScript, React, NodeJS, Webpack],
    post: {
        gallery: {
            boxType: "tablet",
            items: [{
                type: "image",
                href: "assets/projects/konsus/konsus-website-1.png"
            }]
        },
        content: `<p>
<strong>Konsus</strong> is the world's first On-Demand Freelance Business Support service, available
24/7 via chat. Konsus participated in the 2016 winter batch of <a rel="nofollow"
target="_blank" href="http://www.ycombinator.com/">Y Combinator</a> and raised $1.5 million.
</p>
<strong>Tech Achievements:</strong>
<ul>
    <li>migration from NodeJS to Java Spring server</li>
    <li>cross-device seamless authorization</li>
    <li>an invoicing system including automatic billing and work hours tracking</li>
</ul>
`,
    }
};

export const MyCountry3D: Project = {
    title: "My Country 3D",
    dateFrom: new Date(2013, 10),
    dateTo: new Date(2017, 3),
    company: GameInsight,
    role: "Developer / Tech Lead",
    technologies: [Unity3D, CSharp, Java, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            items: [{
                type: "image",
                href: "https://placeimg.com/225/400/tech"
            }]
        },
        content: `<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet purus gravida quis. Sit amet justo donec enim diam vulputate ut pharetra. Sed cras ornare arcu dui. Pulvinar pellentesque habitant morbi tristique senectus. Sit amet consectetur adipiscing elit ut. Sed egestas egestas fringilla phasellus faucibus. Ut aliquam purus sit amet luctus. Sem integer vitae justo eget magna. Quis vel eros donec ac odio tempor. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Mi proin sed libero enim sed faucibus turpis in. Scelerisque eleifend donec pretium vulputate.
</p>`,
    }
};

export const HunterX: Project = {
    title: "HunterX - Zombie Shooter",
    dateFrom: new Date(2013, 2),
    dateTo: new Date(2013, 8),
    company: TSG,
    role: "Developer / Co-Founder",
    technologies: [Unity3D, CSharp],
    post: {
        gallery: {
            boxType: "phone",
            orientation: "horizontal",
            items: [{
                type: "video",
                href: "assets/projects/hunter-x/hunter-x-trailer.mp4"
            }]
        },
        content: `<p>
Planet has gone wrong and portals have been opened to evil creatures willing to conquer the
world. Main Hero - HunterX is a stylish guy who has come to save the planet and destroy all
the evil creatures. 60th feet tall head demon named "Red" is leading the attack on humanity
and has challenged all the mankind with clear intents to enslave the souls of mortals.
</p>
<ul>
  <li>UI powered by <a href="http://www.tasharen.com/?page_id=140">NGUI</a></li>
  <li>Integrations:
    <a rel="nofollow" target="_blank" href="http://www.giftiz.com/">Giftiz</a>,
    <a rel="nofollow" target="_blank" href="https://www.heyzap.com/">heyZap</a>,
    <a rel="nofollow" target="_blank" href="http://www.adcolony.com/">adColony</a>,
    <a rel="nofollow" target="_blank" href="http://www.flurry.com/">Flurry</a>,
    <a rel="nofollow" target="_blank" href="http://www.adbuddiz.com/">AdBuddiz</a>
  </li>
  <li>Platforms: Android, Standalone, Web Player</li>
</ul>
`,
    }
};

const projects = [
    Fronted,
    MyCountryAR,
    Moana,
    KonsusProject,
    MyCountry3D,
    HunterX,
];

// sort by 'dateTo' descending
projects.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

export default projects;
