import 'dotenv/config';
import bcrypt from 'bcrypt';

import {pool} from "./connection.js";

const usersData: [string, string, string, string, string, boolean][] = [
  ['admin1@example.com', 'admin1', 'Brian Johnson', 'https://i.pravatar.cc/150?img=47', 'admin1', true],
  ['user2@example.com', 'user2', 'Alexandra Adams', 'https://i.pravatar.cc/150?img=12', 'user2', true],
  ['user3@example.com', 'user3', 'Carlos Martinez', 'https://i.pravatar.cc/150?img=5', 'user3', true],
  ['user4@example.com', 'user4', 'Emily Chen', 'https://i.pravatar.cc/150?img=7', 'user4', true],
  ['user5@example.com', 'user5', 'Michael Scott', 'https://i.pravatar.cc/150?img=8', 'user5', true],
  ['user6@example.com', 'user6', 'Sofia Ivanova', 'https://i.pravatar.cc/150?img=10', 'user6', true],
  ['user7@example.com', 'user7', 'David Brown', 'https://i.pravatar.cc/150?img=11', 'user7', true],
  ['user8@example.com', 'user8', 'Olivia Taylor', 'https://i.pravatar.cc/150?img=15', 'user8', true],
  ['user9@example.com', 'user9', 'Anna Müller', 'https://i.pravatar.cc/150?img=16', 'user9', true],
  ['user10@example.com', 'user10', 'Liam Anderson', 'https://i.pravatar.cc/150?img=17', 'user10', true],
];

const workspaceData: [string, string, number][] = [
  ['Public Workspace', 'This is a default public workspace available for all users.', 1]
]

const tagsData: [number, number, string][] = [
  [1, 1, 'WebDevelopment'],      [1, 1, 'JavaScript'],      [1, 1, 'Databases'],          [1, 1, 'CloudComputing'],
  [1, 1, 'Frontend'],            [1, 1, 'TypeScript'],      [1, 1, 'MySQL'],              [1, 1, 'DevOps'],
  [1, 1, 'Backend'],             [1, 1, 'ReactJS'],         [1, 1, 'APIs'],               [1, 1, 'AI'],
  [1, 1, 'FullStack'],           [1, 1, 'NodeJS'],          [1, 1, 'Cybersecurity'],      [1, 1, 'MachineLearning'],
]

// posts with id 1-28
// comments with id 29-52
const contentItemData: [number, number, 'post' | 'comment'][] = [
  [1, 2, 'post'],     [1, 5, 'post'],     [1, 10, 'post'],     [1, 1, 'post'],
  [1, 3, 'post'],     [1, 4, 'post'],     [1, 10, 'post'],     [1, 4, 'post'],
  [1, 4, 'post'],     [1, 3, 'post'],     [1, 10, 'post'],     [1, 5, 'post'],
  [1, 1, 'post'],     [1, 4, 'post'],     [1, 10, 'post'],     [1, 6, 'post'],
  [1, 2, 'post'],     [1, 6, 'post'],     [1, 10, 'post'],     [1, 7, 'post'],
  [1, 3, 'post'],     [1, 8, 'post'],     [1, 10, 'post'],     [1, 8, 'post'],
  [1, 4, 'post'],     [1, 9, 'post'],     [1, 10, 'post'],     [1, 9, 'post'],

  [1, 3, 'comment'],  [1, 4, 'comment'],  [1, 5, 'comment'],   [1, 6, 'comment'],
  [1, 5, 'comment'],  [1, 6, 'comment'],  [1, 5, 'comment'],   [1, 8, 'comment'],
  [1, 6, 'comment'],  [1, 3, 'comment'],  [1, 7, 'comment'],   [1, 10, 'comment'],
  [1, 4, 'comment'],  [1, 3, 'comment'],  [1, 2, 'comment'],   [1, 1, 'comment'],
  [1, 6, 'comment'],  [1, 7, 'comment'],  [1, 8, 'comment'],   [1, 8, 'comment'],
  [1, 2, 'comment'],  [1, 3, 'comment'],  [1, 2, 'comment'],   [1, 4, 'comment'],
]

const postsData: [number, string, string, 'draft' | 'published' | 'archived', number | null][] = [
  [1, "Why am I getting \"undefined\" when trying to access object properties in JavaScript?", "I’m working on a small JavaScript project where I need to store some user information in an object and later display it on the page. The object should contain properties like name, email, and age. However, whenever I try to log the values or show them, the console gives me “undefined” instead of the actual data.\n" +
  "\n" + "I already double-checked the spelling of the property names and made sure the object is created before I try to access it. I also tried using both dot notation and bracket notation, but the result is the same.\n" +
  "\n" + "What confuses me the most is that sometimes the object prints fine when I log it entirely, but when I try to reach individual properties, they don’t appear. I’m not sure if this is related to variable scope, timing of execution, or maybe I’m missing some detail about how JavaScript objects work.\n" +
  "\n" + "Can someone explain the common reasons why object properties would return “undefined” even if the object itself looks correct?", 'published', null],
  [2, "Why does my React component not update after state change?", "I have a React component where I use state to track some data. When I trigger a function that updates the state, the value in the console seems to change, but the component on the screen doesn’t re-render with the new value.\n" +
  "\n" + "I already checked that I’m using the useState hook, and the setter function is being called. I also confirmed that the component itself is rendering at least once. Still, the displayed data stays the same no matter how many times I call the update function.\n" +
  "\n" + "I’m wondering if I’m missing something about how React handles re-renders, or if there are cases where changing the state won’t actually cause the component to update. Could this be related to passing props down to child components, or maybe I’m mutating the state incorrectly?\n" +
  "\n" + "What are the most common mistakes that cause this kind of behavior?", 'published', null],
  [3, "Why is my Express server not responding to API requests?", "I’m trying to set up a simple Node.js backend with Express. The server starts without any errors, and I see the “listening on port…” message in the console. However, when I try to make a request from my browser or from a frontend app, the request just hangs and eventually times out.\n" +
  "\n" + "I checked that the port I’m using is not already taken, and I also tried disabling my firewall temporarily. I’m using app.get and app.post routes, and they seem fine at first glance. Still, no response ever comes back.\n" +
  "\n" + "Could this be an issue with middleware, or maybe I forgot to send a response in my route handlers? I’d like to know what typical mistakes can cause an Express server to run but never actually answer requests.", 'published', null],
  [4, "Why does my SQL query return duplicate rows even though I use DISTINCT?", "## Why does my SQL query return duplicate rows even though I use DISTINCT?\n\nI wrote an SQL query where I specifically added the `DISTINCT` keyword,  \nbut I **still get multiple rows** that *look the same*.  \nI expected only unique rows to be returned.\n\n---\n\n### Things I already checked\n- The table **does** have some duplicate-looking entries\n- I thought `DISTINCT` would remove them\n- However, the results still contain rows that *seem identical*\n\n---\n\n### Possible reasons\n1. Hidden whitespace in text fields  \n2. Case sensitivity (`\"ABC\"` ≠ `\"abc\"`)  \n3. Differences in **other columns** not included in `SELECT`  \n\n---\n\n### Example\n```sql\nSELECT DISTINCT name, email\nFROM users\nORDER BY name;\n```",
    'published', null],
  [5, "Why do I get a NullPointerException when working with objects in Java?", "I’m writing a small Java program where I create a class with some fields and methods. Everything compiles fine, but when I run the program, I get a NullPointerException. The error points to the line where I try to use one of the fields.\n" +
  "\n" + "I thought I had already initialized the object, but apparently not. I also tried creating a constructor to set default values, but the issue still happens. I know that a NullPointerException usually means something wasn’t initialized, but in this case I can’t figure out exactly what is missing.\n" +
  "\n" + "What are the typical causes of a NullPointerException in Java, and how do I properly avoid it when working with objects and fields?", 'published', null],
  [6, "Why does TypeScript complain that my value can be undefined?", "In my TypeScript project, I keep getting an error that says something like “Type ‘string | undefined’ is not assignable to type ‘string’.” I don’t understand why TypeScript thinks the value could be undefined, because I’m pretty sure I always assign it before using it.\n" +
  "\n" + "I tried adding type annotations, but the error still appears. Sometimes the error shows up when I use optional properties from an object, or when I read query parameters. It’s confusing because in plain JavaScript this would just work, but in TypeScript it seems stricter.\n" +
  "\n" + "What is the correct way to handle values that TypeScript considers possibly undefined? Should I use type narrowing, default values, or is there some other best practice for this situation?", 'published', null],
  [7, "Why is my CSS not applying to a component in React?", "I added a CSS file to style a React component, but none of the styles seem to take effect. The component renders, but it looks completely unstyled, even though the CSS file has rules that should apply.\n" +
  "\n" + "I checked the class names carefully, and they match exactly what I wrote in the JSX. I also made sure the CSS file is imported at the top of the component file. Still, nothing changes.\n" +
  "\n" + "Could this be because of CSS modules, naming conflicts, or the way React handles styles? Are there common pitfalls that cause styles to be ignored in a React app?", 'published', null],
  [8, "Why does my Python function return None even though I have a return statement?", "I’m writing a Python function that should calculate and return a value. However, when I call it and print the result, it just shows None. I double-checked and there is a return statement in the function, but somehow it’s not giving me the expected output.\n" +
  "\n" + "I thought maybe indentation is the problem, or I accidentally placed the return inside a conditional block that isn’t running. But even after moving things around, the result still seems wrong.\n" +
  "\n" + "What are the common reasons why a Python function might return None even when you think you’ve written a proper return statement?", 'published', null],
  [9, "Why is my Git commit not showing up on GitHub after pushing?", "I made some changes to my local project, added the files, and committed them. Then I ran git push and it seemed to work without errors. But when I check the repository on GitHub, the new commit doesn’t appear.\n" +
  "\n" + "I verified that I’m on the right branch locally, but I’m not sure if GitHub is showing the same branch or if I accidentally pushed to another one. It’s also possible that I didn’t set the upstream branch correctly.\n" +
  "\n" + "What are the typical causes of a commit not showing up on GitHub even though the push command looks successful?", 'published', null],
  [10, "Why does my Docker container exit immediately after starting?", "I built a Docker image for a small app, and when I run it, the container starts but then exits right away. There’s no error message on the screen, it just stops running.\n" +
  "\n" + "I checked the logs and they don’t show much, just that the process ended. I expected the app to keep running in the background. Maybe I set the wrong command in the Dockerfile, or the process finishes too quickly.\n" +
  "\n" + "What are the usual reasons a Docker container exits immediately, and how can I keep it running as expected?", 'published', null],
  [11, "Why is my API call returning 401 Unauthorized even with the correct token?", "I’m trying to call a protected API endpoint that requires a token. I pass the token in the headers, but the server still responds with “401 Unauthorized.” I copied the token directly from the login response, so I’m sure it should be valid.\n" +
  "\n" + "I also tried using tools like Postman, and sometimes the request works there but not in my frontend code. I’m wondering if this has something to do with how headers are sent, or maybe the token expires faster than I thought.\n" +
  "\n" + "What are the common mistakes that lead to 401 errors when working with authentication tokens in an API?", 'published', null],
  [12, "Why is my HTML button not showing up on the page?", "I added a <button> element inside my HTML file, but when I open the page in the browser, nothing appears. I can see other text on the page, but the button is missing.\n" +
  "\n" + "I already checked that the file is saved and refreshed in the browser. I also tried writing the button in different places inside the <body> but it still doesn’t show up.\n" +
  "\n" + "What are the common reasons an HTML button might not be visible on the page?", 'published', null],
  [13, "Why does my CSS color not change the text?", "I wrote a CSS rule to make my text red, but when I open the page, the text is still black. I expected the color to change.\n" +
  "\n" + "I tried using both the color name (“red”) and a hex code, but neither works. I also made sure to link the CSS file in the HTML with a <link> tag. Still, the text doesn’t change color.\n" +
  "\n" + "Could it be that another style is overriding mine, or maybe the CSS file is not loading at all?", 'published', null],
  [14, "Why is my JavaScript not running when I click a button?", "I wrote a small JavaScript function that should show an alert when I click a button. However, when I click the button in the browser, nothing happens.\n" +
  "\n" + "I double-checked that the function name is the same as the one I put in the onclick attribute. I also saved the file and refreshed the page. Still, the alert never appears.\n" +
  "\n" + "What are the most common reasons JavaScript doesn’t run in the browser when clicking a button?", 'published', null],
  [15, "Why does npm install not work on my project?", "I’m trying to run npm install after downloading a project, but it gives me errors and doesn’t install the packages. I expected it to create the node_modules folder with everything I need, but instead it just stops with warnings or errors.\n" +
  "\n" + "I already tried deleting the node_modules folder and package-lock.json, but that didn’t help. I’m not sure if the problem is with my Node.js version or with the internet connection.\n" +
  "\n" + "What are the usual steps to fix npm install when it doesn’t work?", 'published', null],
  [16, "Why doesn’t my image show up in the browser?", "I added an <img> tag with a file name, but when I open the page, the image is broken and doesn’t load. I expected to see the picture.\n" +
  "\n" + "I checked that the image file is in the same folder as the HTML file, and the file name looks correct. But the browser still shows a broken image icon.\n" +
  "\n" + "What are the typical reasons why images don’t display in HTML pages?", 'published', null],
  [17, "Why is my HTML link opening in the same tab instead of a new one?", "I created a link with an <a> tag, and I want it to open in a new tab. But when I click it, it always opens in the same window. I thought browsers automatically open links in new tabs, but apparently not.\n" +
  "\n" + "Is there a simple way to make a link always open in a new tab, and is it considered good practice?", 'published', null],
  [18, "Why does my Java loop run one time less than expected?", "I wrote a for loop in Java that should print numbers from 1 to 10, but instead it only prints 1 through 9. I expected it to include 10.\n" +
  "\n" + "I checked the condition, and it looks fine to me. I’m still not sure why the last number is missing. Could this be something about how loop conditions are evaluated?", 'published', null],
  [19, "Why does my SQL query say \"unknown column\" even though the column exists?", "I’m trying to select a column from a table, but MySQL gives me an error: “unknown column.” When I check the table with DESCRIBE, the column is clearly there.\n" +
  "\n" + "I already checked the spelling, but the error keeps showing up. Could it be about using backticks, aliases, or maybe the column belongs to another table in the join?\n" +
  "\n" + "What usually causes this kind of error in SQL?", 'published', null],
  [20, "Why can’t I stay motivated to finish my programming course?", "I enrolled in an online programming course and started very motivated. But after a few weeks, I keep losing focus, and I procrastinate instead of doing the exercises. I still want to learn, but I can’t make myself sit down and practice regularly.\n" +
  "\n" + "Has anyone else had the same problem? What strategies can help me stay consistent and actually finish the course?", 'published', null],
  [21, "Why do I forget everything after watching coding tutorials?", "I watch a lot of tutorials about JavaScript and web development. While I’m watching, everything makes sense, but as soon as I try to code on my own, I feel like I forgot everything.\n" +
  "\n" + "Is this normal when learning programming? How do I make the knowledge stick so I can actually build things without constantly going back to the videos?", 'published', null],
  [22, "Why is my laptop so slow when running VS Code and a browser at the same time?", "I’m trying to practice coding with VS Code, but whenever I also open Chrome with a few tabs, my laptop becomes extremely slow. Sometimes VS Code even freezes.\n" +
  "\n" + "I don’t know if this is because of my hardware specs or if there are settings I should change in VS Code or the browser. What can beginners do to improve performance when coding on a weak laptop?", 'published', null],
  [23, "Why is my Wi-Fi working on my phone but not on my laptop?", "At home, I’m connected to Wi-Fi on my phone without any issues, but when I try to connect my laptop to the same network, it either doesn’t connect or it connects but says “no internet.”\n" +
  "\n" + "I restarted the router and also rebooted the laptop, but the issue keeps happening. Other people in my house can use the Wi-Fi on their devices, so it seems like the network is fine. My laptop detects the network and asks for the password, but even after entering it, the browser won’t load any websites.\n" +
  "\n" + "I tried forgetting the network and reconnecting, and even updated my Wi-Fi driver, but nothing changed. Could this be a problem with firewall settings, DNS configuration, or maybe something with the laptop’s network card?\n" +
  "\n" + "What are the usual troubleshooting steps when Wi-Fi works on some devices but not on others?", 'published', null],
  [24, "Why is my Windows laptop so slow after startup?", "Every time I turn on my laptop, it takes several minutes before I can actually open programs or browse the internet. During that time, the fan is loud and the system feels frozen. After 5–10 minutes, it becomes faster, but it’s very frustrating to wait.\n" +
  "\n" + "I already checked for viruses with antivirus software, and I didn’t find anything suspicious. I also disabled a few startup programs, but it didn’t help much. The laptop is only a few years old, and I mainly use it for studying and browsing, so I don’t think it should be this slow.\n" +
  "\n" + "Could it be caused by too many background processes, lack of RAM, or maybe the hard drive getting old? What are the best ways to speed up Windows startup for a laptop that isn’t completely outdated?", 'published', null],
  [25, "Why doesn’t my Linux terminal recognize simple commands?", "I recently installed Ubuntu because I want to learn Linux, but sometimes when I type commands that I see in tutorials (like python3, git, or even code to open VS Code), the terminal says “command not found.”\n" +
  "\n" + "I thought Linux came with these tools pre-installed, but maybe not. I tried running sudo apt update and installing some of them, but I don’t really know what packages I should install. It feels confusing because in tutorials everything just “works,” but for me the system doesn’t recognize half of the commands.\n" +
  "\n" + "Is this normal when using Linux for the first time? What’s the correct approach to making sure I have all the basic developer tools installed?", 'published', null],
  [26, "Why does my Zoom call keep freezing even though my internet seems fine?", "Whenever I join a Zoom call, after a few minutes my video and audio start freezing, and sometimes I even get disconnected. But when I test my internet speed in the browser, it shows decent numbers and I can watch YouTube in HD without problems.\n" +
  "\n" + "I already tried switching from Wi-Fi to a cable connection, and I also closed all other apps while on the call, but the problem keeps happening. It’s especially frustrating during online classes when I miss explanations from the teacher.\n" +
  "\n" + "Is it possible that Zoom needs specific settings to work better, or could it be related to my computer’s performance rather than the internet itself? What are the best ways to troubleshoot freezing issues in video calls?", 'published', null],
  [27, "Why is my laptop battery draining so fast while coding?", "I use my laptop for coding in VS Code and running a local server. Even when I’m not doing heavy tasks like gaming or video editing, the battery goes from 100% to 20% in less than two hours.\n" +
  "\n" + "I checked the battery health, and it says it’s still okay. I also lowered the brightness and turned off Wi-Fi when I don’t need it, but the battery still drains very quickly. It feels strange because I thought coding shouldn’t use that much power compared to other activities.\n" +
  "\n" + "Could this be because of too many background processes, or maybe extensions in VS Code consuming resources? How do developers usually optimize battery life when working on laptops?", 'published', null],
  [28, "Why does my VS Code debugger not stop at breakpoints?", "I’m trying to debug a small JavaScript project in VS Code. I set breakpoints in several lines of my code, but when I run the debugger, it just runs through everything without stopping. I expected the debugger to pause at the breakpoints so I could inspect variables and step through the code.\n" +
  "\n" + "I double-checked that I’m using the correct launch configuration and that the debugger is attached to the right file. I also tried restarting VS Code and reinstalling some extensions, but it still doesn’t work. The code itself runs fine, so it’s not a syntax error.\n" +
  "\n" + "Could this be caused by the way Node.js or the browser handles the code, or is there something specific in VS Code settings that might prevent breakpoints from being hit? What are common troubleshooting steps for this issue?", 'published', null],
]

const postsTagsData: [number, number][] = [
  [10, 2], [10, 3], [10, 6], [1, 7], [1, 10], [1, 15], [1, 21], [11, 27], [11, 22], [11, 11], [11, 3],
  [12, 2], [12, 12], [2, 6], [2, 7], [13, 10], [13, 15], [13, 21], [13, 27], [3, 22], [3, 11], [3, 3],
  [14, 4], [14, 5], [14, 8], [4, 9], [4, 12], [4, 13], [4, 14], [15, 16], [15, 17], [5, 18], [5, 19],
  [16, 20], [6, 23], [16, 24], [6, 25], [6, 26], [6, 28], [7, 3], [7, 6], [7, 9], [7, 12], [7, 15],
  [8, 18], [8, 21], [8, 24], [8, 27], [9, 2], [9, 4], [9, 6], [9, 8], [9, 10], [9, 12], [9, 14],

]

const commentsData: [number, number, number, string][] = [
  [29, 1, 1, 'One common reason you might see “undefined” when accessing object properties is that the property doesn’t actually exist at the moment you try to access it. Even if the object exists, if you try to read a property that hasn’t been assigned yet, JavaScript will return undefined.\n' +
  '\n' + 'Sometimes this happens because of the timing of execution. For example, if the object is being filled asynchronously or inside a function that hasn’t run yet, logging the object might show all properties later, but accessing them immediately will give undefined. Make sure the object is fully initialized before trying to read its properties.'],
  [30, 1, 1, 'Another thing to check is variable scope. If you have multiple variables with similar names or are creating the object inside a function, you might be accessing a different object than you expect. Even if console.log(object) shows the right values, you might be reading from a shadowed variable or from a copy that hasn’t been updated yet.\n' +
  '\n' + 'Also, pay attention to this. If you’re inside a class or a method and using this.user, this might not refer to what you think it does. Arrow functions and regular functions handle this differently, so that can cause properties to appear as undefined.'],
  [31, 1, 1, 'It’s worth checking for typos or invisible characters in property names. Sometimes a property might look like name but actually contains an extra space or a non-breaking character, making object.name return undefined.\n' +
  '\n' + 'If logging the entire object shows the properties but accessing them individually fails, try copying the property names directly from the console output. You can also use Object.keys(object) to see the actual keys present in the object.'],
  [32, 1, 1, 'Finally, consider how you are accessing nested objects. If your object has nested structures, trying to read a property on undefined will also give you undefined. For example, if object.user is not yet defined, then object.user.name will throw an error or return undefined.\n' +
  '\n' + 'Using optional chaining (object.user?.name) can help avoid errors, but it won’t magically create missing properties. You need to make sure the full object path exists before reading the property.'],
  [33, 1, 29, 'Sometimes undefined appears because the property is being set conditionally. For example, if you assign properties only when certain conditions are true, and those conditions aren’t met, the property simply doesn’t exist yet. It’s good practice to either initialize all expected properties with default values or check for their existence before using them.'],
  [34, 1, 29, 'I agree with the point about timing of execution. Another thing to consider is promises and asynchronous code. If your object is being populated after a fetch or some async operation, trying to access the properties immediately will give undefined. You might want to wait for the promise to resolve or use async/await so that the object is fully ready before you read its properties.'],
  [35, 1, 34, 'Yes, exactly! I’ve run into this many times when using fetch or axios. Logging the object in the console can be misleading because the console sometimes shows the final state after the asynchronous operation completes, even though your code tried to access the properties earlier. Using await or handling the promise properly usually fixes the issue.'],
  [36, 2, 2, 'One common reason your component doesn’t update is mutating the state directly instead of using the setter function returned by useState. In React, you must always treat state as immutable. For example, if you modify an object or array directly and then call the setter with the same reference, React might not detect the change, so the component won’t re-render. Always create a new copy of the state when updating, e.g., using spread syntax.'],
  [37, 2, 2, 'Another possibility is passing state as props to child components and not updating them correctly. If the child component is wrapped with React.memo or implements shouldComponentUpdate, it might not re-render even when the parent state changes. Make sure you either pass a new reference or don’t block re-rendering in the child.'],
  [38, 2, 2, 'React sometimes doesn’t update the UI because console.log is asynchronous. If you log the state right after calling the setter, you might see the old value, which confuses people. To fix it, you should call setState and then immediately log the new value.'],
  [39, 2, 2, 'It could be because your component is a functional component. Functional components don’t re-render automatically like class components, so you need to convert it into a class component for the state updates to reflect.'],
  [40, 2, 38, 'Not quite — it’s true that setState is asynchronous, and console.log right after calling the setter might show the old value. However, logging immediately isn’t a bug in React; it doesn’t prevent re-rendering. The component still updates correctly in the UI. To see the updated state reliably, you can use useEffect with the state as a dependency.'],
  [41, 2, 39, 'This is incorrect. Functional components do re-render when state changes via useState. You don’t need to convert to class components. The issue is usually related to direct mutation of state or memoization of child components, not the component type.'],
  [42, 3, 3, 'One very common mistake is forgetting to send a response in your route handler. If you define a route with app.get(\'/something\', (req, res) => { ... }) but never call res.send(), res.json(), or res.end(), the request will just hang until it times out. Always make sure every request path ends with sending a response.'],
  [43, 3, 3, 'Another possibility is middleware order. For example, if you register some middleware that never calls next(), it will block the request before reaching your route. A missing next() in custom middleware is a very common cause of requests that hang indefinitely.'],
  [44, 3, 3, 'Check that you’re actually listening on the correct network interface. By default, app.listen(port) binds to localhost (127.0.0.1). If you try to connect from another device or even Docker, the server might not be reachable. In that case, you should use app.listen(port, "0.0.0.0") to accept external connections.'],
  [45, 3, 3, 'It’s because you didn’t install body-parser. Express apps always need body-parser for all requests, otherwise the server won’t respond. Just add app.use(express.json()) and it will fix everything.'],
  [46, 3, 3, 'Your problem is that you’re not running Express in development mode. By default, Express ignores requests unless NODE_ENV=development. Set that variable and it should start responding.'],
  [47, 3, 45, 'Not quite. While parsing middleware like express.json() is required to read request bodies, it’s not mandatory for the server to respond. Even without it, routes like app.get(\'/test\', ...) will still work. Missing body-parser would only cause issues if you try to access req.body on JSON or form requests, but it won’t make the entire server hang.'],
  [48, 3, 46, 'This is incorrect. Express doesn’t require any special environment to respond. It works the same in development, production, or any custom NODE_ENV value. If requests are hanging, the cause is usually missing res.send, middleware that blocks the chain, or binding to the wrong interface — not the environment variable.'],
  [49, 4, 4, 'DISTINCT only works on numeric columns. If you have text columns, it won’t remove duplicates properly because SQL can’t compare strings the same way. You should cast everything to integers or IDs before using DISTINCT.'],
  [50, 4, 49, 'This is not correct. DISTINCT works with all data types, including text, dates, numbers, and even composite rows. SQL can compare strings perfectly fine, according to the database collation rules. You don’t need to cast to integers.'],
  [51, 4, 50, 'DISTINCT works on all column types, not just numbers. If duplicates remain in text columns, it’s usually because of case-sensitivity, extra spaces, or other selected columns making rows unique. No casting to integers is needed.'],
  [52, 4, 4, 'Another common reason is hidden differences in the data. For example, trailing spaces, different letter casing (depending on collation), or even invisible characters like \\n can make two values different even if they look the same in your client. Using functions like TRIM() or LOWER() can help reveal this.']
]

const categoriesData: [number, string, string][] = [
  [1, 'Frontend', 'All about building user interfaces with HTML, CSS, and JavaScript frameworks like React, Vue, and Angular.'],
  [1, 'Backend', 'Server-side development including Node.js, Python, Java, databases, APIs, and server architecture.'],
  [1, 'Fullstack', 'Combination of frontend and backend development, covering the entire application stack.'],
  [1, 'DevOps', 'Continuous integration, deployment, cloud infrastructure, CI/CD pipelines, and automation.'],
  [1, 'Mobile', 'Development for mobile platforms including iOS, Android, and cross-platform frameworks like Flutter and React Native.'],
  [1, 'Data Science', 'Data analysis, machine learning, AI, statistics, and data visualization techniques.'],
  [1, 'AI & Machine Learning', 'Artificial intelligence, neural networks, deep learning, and related technologies.'],
  [1, 'Cybersecurity', 'Protecting systems, networks, and data from digital attacks and vulnerabilities.'],
  [1, 'Cloud Computing', 'Cloud platforms such as AWS, Azure, GCP, serverless architectures, and cloud deployment strategies.'],
  [1, 'Programming Languages', 'Discussions and topics about specific languages like Python, Java, JavaScript, C++, Go, Rust, etc.'],
  [1, 'Databases', 'Relational and non-relational databases, SQL, NoSQL, optimization, and query strategies.'],
  [1, 'Web3 & Blockchain', 'Decentralized applications, blockchain technology, smart contracts, and crypto development.'],
  [1, 'UI/UX Design', 'User interface and user experience design, accessibility, prototyping, and usability principles.'],
  [1, 'Testing & QA', 'Software testing, automated tests, quality assurance processes, and test-driven development.'],
  [1, 'Career & Education', 'Advice on IT careers, learning resources, certifications, and personal growth in tech.'],
]

const categoriesPostsData: [number, number][] = [
  [1, 1],    [2, 1],    [3, 1],    [4, 1],    [5, 1],    [6, 1],
  [7, 1],    [8, 1],    [9, 1],    [10, 1],   [11, 1],   [12, 1],
  [13, 1],   [14, 1],   [15, 1],   [16, 1],   [17, 1],   [18, 1],
  [19, 1],   [21, 1],   [22, 1],   [23, 1],   [24, 1],   [25, 1],
  [26, 1],   [27, 1],   [28, 1]
]

const savedPostsData: [number, number][] = [
  [1, 1], [1, 5], [1, 3], [1, 10], [1, 11], [1, 12],
  [2, 3], [2, 5], [2, 6], [2, 18], [2, 21], [2, 22],
  [3, 1], [3, 5], [3, 3], [3, 10], [3, 13], [3, 15],
  [4, 4], [4, 7], [4, 8], [4, 12], [4, 17], [4, 18],
  [5, 1], [5, 5], [5, 3], [5, 10], [5, 11], [5, 12],
  [6, 1], [6, 5], [6, 3], [6, 16], [6, 17], [6, 18],
  [7, 1], [7, 5], [7, 3], [7, 10], [7, 11], [7, 12],
  [8, 1], [8, 5], [8, 3], [8, 16], [8, 17], [8, 18],
  [9, 1], [9, 5], [9, 3], [9, 10], [9, 13], [9, 15],
  [10, 3], [10, 5], [10, 6], [10, 18], [10, 21], [10, 22],
]

const reactionsData: [number, number, 'like' | 'dislike'][] = [
  [1, 3, 'like'],         [2, 7, 'dislike'],      [3, 15, 'like'],      [4, 22, 'like'],
  [5, 11, 'dislike'],     [6, 18, 'like'],        [7, 25, 'like'],      [8, 31, 'dislike'],
  [9, 40, 'like'],        [10, 12, 'like'],       [1, 19, 'dislike'],   [2, 5, 'like'],
  [3, 27, 'like'],        [4, 9, 'like'],         [5, 16, 'dislike'],   [6, 33, 'like'],
  [7, 21, 'dislike'],     [8, 8, 'like'],         [9, 44, 'like'],      [10, 50, 'dislike'],
  [1, 14, 'like'],        [2, 30, 'like'],        [3, 6, 'dislike'],    [4, 41, 'like'],
  [5, 20, 'like'],        [6, 29, 'dislike'],     [7, 36, 'like'],      [8, 13, 'dislike'],
  [9, 47, 'like'],        [10, 2, 'like'],        [1, 28, 'dislike'],   [2, 46, 'like'],
  [3, 10, 'like'],        [4, 39, 'dislike'],     [5, 23, 'like'],      [6, 1, 'like'],
  [7, 35, 'dislike'],     [8, 26, 'like'],        [9, 42, 'like'],      [10, 17, 'dislike'],
  [1, 4, 'like'],         [2, 51, 'dislike'],     [3, 24, 'like'],      [4, 48, 'like'],
  [5, 37, 'dislike'],     [6, 32, 'like'],        [7, 52, 'like'],      [8, 45, 'dislike'],
  [9, 34, 'like'],        [10, 38, 'like']
]

async function seed() {
  // populate users
  const users = await Promise.all(
    usersData.map(async user => {
      const password_hash = await bcrypt.hash(user[4], 10);
      return [user[0], user[1], user[2], user[3], password_hash, user[5]] as [string, string, string, string, string, boolean];
    })
  );

  await pool.query(
    `INSERT INTO user (email, login, fullName, profilePicture, password_hash, is_verified)
     VALUES ?
     ON DUPLICATE KEY UPDATE
     email = VALUES(email),
     login = VALUES(login);`,
    [users]
  );

  console.log('Table "user" seeded.');

  await pool.query(`
    INSERT INTO workspace (name, description, owner)
    VALUES ?
    ON DUPLICATE KEY UPDATE name = name;`,
    [workspaceData]
  );
  console.log('Table "workspace" seeded.');

  await pool.query(`
  INSERT INTO contentItem (workspace, author, type)
  VALUES ?`,
    [contentItemData])

  console.log('Table "contentItem" seeded.');

  await pool.query(`
  INSERT INTO post (contentItemId, title, content, status, acceptedComment)
  VALUES ?`,
    [postsData])

  console.log('Table "post" seeded.');

  await pool.query(`
  INSERT INTO comment (contentItemId, post, target, content)
  VALUES ?`,
    [commentsData])

  console.log('Table "comment" seeded.');

  await pool.query(`
  INSERT INTO tag (workspace, author, title)
  VALUES ?`,
    [tagsData])

  console.log('Table "tag" seeded.');

  await pool.query(`
  INSERT INTO postsTags (tag, post)
  VALUES ?`,
    [postsTagsData])

  console.log('Table "postsTags" seeded.');

  await pool.query(`INSERT INTO category (workspace, title, description) VALUES ?`, [categoriesData])
  console.log('Table "categories" seeded.');
  await pool.query(`INSERT INTO postsCategories (post, category) VALUES ?`, [categoriesPostsData])
  console.log('Table "post categories" seeded.');
  await pool.query(`INSERT INTO savedPost (user, post) VALUES ?`, [savedPostsData]);
  console.log('Table "savedPost" seeded.');
  await pool.query(`INSERT INTO reaction(user, contentItemId, type) VALUES ?`, [reactionsData])
  console.log('Table "reaction" seeded.');

  // TO DO: seed other tables here

}

if (import.meta.url === `file://${process.argv[1]}`)  {
  seed().then(() => {
    console.log(`seed finished`)
    process.exit(0);
  });
}