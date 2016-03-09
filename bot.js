var token = "xoxb-24169967366-YRMKeNHL5yM2ikGe67GB7LOS";

var Botkit = require('botkit');
var fullChannelList = [];

//put the app into testing mode (shortens time cycle to one minute, and doesn't check last hour ran)
var testing = false;

var fitChannelNames = ['do-stuff-outdoors','tough-mudder-2016','hourly-pushups'];
//var fitChannelNames = ['fit-channel-test-1','fit-channel-test-2'];

var fitChannelList = [];

var lastRan = {day:0,hour:0,minute:0};
var dayFrom = 1; //monday
var dayTo = 5; //friday

var scheduleIterationTime = 60 * 1000; //1 minute
if(testing)
	scheduleIterationTime = 1000;

var offset = 7;
var timeFrom = 7 + offset; //8am
var timeTo = 16 + offset; //4pm

var exerciseMin = 8;
var exerciseMax = 20;

var exercises = [
	{name:'pushups', how:'With your chest laying flat on the ground, push your body away from the ground.'},
	{name:'burpees', how:'Alternate between one push up, and one jump to touch the stars. Repeat.'},
	{name:'flutter kicks', how:'Laying on your back, hands under your butt, with straight legs, kick your toes from 6 inches to 36 inches.'},
	{name:'wall sits', how:'Put your back against the wall, and lower your butt towards the ground until your thighs are parrallel to the ground. Hold it for N number of seconds.'},
	{name:'air squats', how:'Stand with your feet shoulder width apart.  Lower your butt towards your heels, keeping your back flat while looking forward. Then stand up.'},
	{name:'mountain climbers', how:'Get in push up position. Then alternate bringing one knee up to your chest then back straight again. As if you are running in place while in push up position.'},
	{name:'v-ups', how:'Lay on your back.  Lift your legs straight into the air.  Then crunch up and try to touch your toes.  Leaving your feet in the air, lower back to the ground.  And repeat.'},
	{name:'planks', how:'Start by getting into pushup position.  Then drop down onto your elbows.  Keep your back flat and your core engaged.  Hold this position for 3X N seconds.'},
	{name:'jumping jacks', how:'Start with your feet together, hands at your side. Jump into the air and land with your feet shoulder width apart and hands over head (clapping optional). Then jump again and land in the starting position.'},
	{name:'lunges', how:'Start with your feet together. Step out with one foot and lunge forward dropping your butt low enough so that your front thigh is parrallel to the ground. Bring your back foot up and lunge out with that foot. Repeat.'}
];

var messages = [
	'Lets get your blood pumping by doing *N* *E*!',
	'*N* quick *E* will get your breathing!',
	'Break up your day with *N* fun *E*!',
	'If you are in a meeting, doing *N* quick *E* might look silly - but you are worth it!',
	'*N* quick *E* is all you need to do this time around!',
	'WAKE UP and do *N* *E*!',
	'ALRIGHT MAGGOT PUKE - give me *N* *E*!',
	'Like apples, *N* *E* a day will keep you healthy!',
	'*N* *E*, kid tested, mother approved.',
	'I may not be there yet, but with *N* more *E*, I\'m closer than I was yesterday',
	'Slow progress is better than no progress! *N* *E*',
	'When you think about quitting think about why you started doing *N* *E*',
	'Sweat is just fat crying! *N* *E*',
	'Strive for progress not perfection. *N* *E*',
	'You are only *N* *E* from a great mood!',
	'If it doesn\' challenge you it doesn\'t change you! *N* *E*',
	'Every journey begins with *N* *E*. But you\'ll never finish if you don\'t start.',
	'I. WILL. NOT. BE. STOPPED. *N* *E*',
	'Push yourself.  No one is going to do it for you. *N* *E*',
	'It pains me to do another *N* *E*. But it hurts much worse to stop.',
	'Once you see results it becomes addiction. *N* *E*',
	'Do your best and forget the rest. *N* *E*',
	'Sore today strong tomorrow! *N* *E*'];

var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: token
})

bot.startRTM(function(err,bot,payload) 
{

	if (err) 
	{
	    throw new Error('Could not connect to Slack');
	}

	startUp(bot);

});

function startUp(bot)
{
	//find the channel(s) we want to speak through
	bot.api.channels.list({}, function (err, response) {
        if (response.hasOwnProperty('channels') && response.ok) {
        	console.log('startUp : Building a local channel list');
            var total = response.channels.length;

            //get channel id for fitchannel names
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                fullChannelList.push({name: channel.name, id: channel.id});

                if(inFitChannelNames(channel.name))
                {
                	fitChannelList.push(channel);
                }
            }

            console.log('startUp : Found the following fitness channels');
            for(i=0;i<fitChannelList.length;i++)
            {
            	console.log(fitChannelList[i].name + ' ' + fitChannelList[i].id);
            }

            setInterval(function(){evaluateNextExerciseRun(bot);}, scheduleIterationTime);
        }
        else
        {
        	throw new Error('no channels retrieved');
        }
    });
}

function getRandomExercise()
{
	var count = Math.round(Math.random() * (exerciseMax - exerciseMin) + exerciseMin);
	var exercise = exercises[Math.floor(Math.random()*exercises.length)];
	var message = messages[Math.floor(Math.random()*messages.length)]
	var msg = message.replace('*E*',exercise.name) + ' <!here|here>';
	msg = msg.replace('*N*',count);

	console.log('getRandomExercise: ' + msg);

	return msg;
}

function sayRandomExerciseToFitnessChannels(bot)
{
	var msg = getRandomExercise();

	sayToFitnessChannels(bot,msg);
}

function evaluateNextExerciseRun(bot)
{
	var now = new Date();

	console.log('evaluateNextExerciseRun');

	//are we in the time band to schedule an exercise?
	if(now.getHours() >= timeFrom && now.getHours() <= timeTo)
	{
		//have we ever run?
		if(lastRan.hour == 0)
		{
			sayRandomExerciseToFitnessChannels(bot);
			lastRan = {day:now.getDay(),hour:now.getHours(),minute:now.getMinutes()};
		}
		//did we run this hour already?
		else if(now.getHours() != lastRan.hour)
		{
			//testing always runs
			if(testing)
			{
				sayRandomExerciseToFitnessChannels(bot);
			}
			else if(now.getMinutes() < 30)
			{
				sayRandomExerciseToFitnessChannels(bot);	
				lastRan = {day:now.getDay(),hour:now.getHours(),minute:now.getMinutes()};
			}
			else
			{
				console.log('top of the hour');
			}
		}
		else
		{
			console.log('evaluateNextExerciseRun : Already ran an exercise in this hour');
		}
	}
	else
	{
		console.log('evaluateNextExerciseRun : Outside of normal operating hours');
	}
}

//scan the fit channel names for this channel
function inFitChannelNames(name)
{
	for(i = 0;i<fitChannelNames.length;i++)
	{
		if(name == fitChannelNames[i])
		{
			console.log('inFitChannelNames : ' + name + ' - true');
			return true;
		}
	}
	return false;
}

function inExercises(name)
{
	console.log('inExercises : Looking to see if we have ' + name + ' in our list of exercises');
	for (var i = exercises.length - 1; i >= 0; i--) {
		if(name == exercises[i].name)
		{
			console.log('inExercises : Found ' + name + ' in the list of exercises.');
			return true;
		}
	};

	console.log('inExercises : Didnt find ' + name + ' in the list of exercises');
	return false;
}

function sayToFitnessChannels(bot, msg)
{
	for(i=0;i<fitChannelList.length;i++)
	{
		try
		{
			var channel = fitChannelList[i];
			message = {text:msg, channel: channel.id};
			console.log('sayToFitnessChannels : channel: ' + channel.name + ' ' + channel.id);
			bot.say(message);	
		}
		catch(e)
		{
			console.log('EXCEPTION - sayToFitnessChannels : channel: ' + channel.name + ' ' + channel.id);
			console.log(e);
		}
	}
}

//advertising the fitbot
controller.hears(["push up","pushups", "burpees","tough mudder", "spartan race","battle frog", "race", "marathon","run", "burpee","wod","work out", "OCR", "get to work", "sit ups"],["mention","ambient"],
	function(bot,message) {
		console.log("HEARD : " + message.text);

	  var msg = 'You must work out? Come join us over at one of these channels and get real time works outs at your desk! Channels:';
	  for (var i = fitChannelList.length - 1; i >= 0; i--) {
	  	msg = msg + ' <#' + fitChannelList[i].id + '|' + fitChannelList[i].name + '>';
	};

  bot.reply(message, msg);
});

//help
controller.hears(["help","how do I do","what is"], ["mention", "direct_mention", "direct_message"], function(bot,message){
	bot.startConversation(message, help_askStarter);
});

//get a random exercise
controller.hears(["random"], ["mention", "direct_mention", "direct_message"], function(bot, message){
	var msg = getRandomExercise();
	bot.reply(message, msg);
});

//list commands
controller.hears(["list"],["mention", "direct_mention", "direct_message"], function(bot, message){
	bot.reply(message, "help: starts a conversation with fitbot");
	bot.reply(message, "list: lists commands that fitbot currently supports");
	bot.reply(message, "exercise *: teaches you how to perform an exercise");
	bot.reply(message, "exercises: lists all the exercies fitbot currently knows");
	bot.reply(message, "random: gives you a random exercise to do");
});

//exercise help
//TODO: implement exercise help
controller.hears(['exercises'], ["mention", "direct_mention", "direct_message"], function(bot, message){
	var exercises = getExercises();
	for(var i = 0;i<exercises.length;i++)
	{
		bot.reply(message,exercises[i].name);
	}
});

controller.hears(['exercise'], ["mention", "direct_mention", "direct_message"], function(bot, message){
	var helpText = message.text.replace("exercise ","");
	var exercise = getExercise(helpText);
	if(exercise != null)
	{
		bot.reply(message, 'To do ' + exercise.name + ' do the following: ' + exercise.how);
	}
	else
	{
		bot.reply(message, 'Couldn\'t find that exercise!');
	}
});

help_askStarter = function(response, convo)
{
	convo.ask('I am here to help you. Type LIST or reply with the exercise name you are interested in.', function(response, convo){
		console.log('HELP : askStarter : The user said: ' + response.text);

		if(response.text == "list") //list commands
			help_listCommands(response, convo);

		else if(inExercises(response.text))
			help_showExerciseHelp(response, convo);

		convo.next();
	});

};

function getExercises()
{
	return exercises;
}
function getExercise(name)
{
	console.log('locating exercise by name: ' + name);

	for (var i = 0;i < exercises.length; i ++) {
		console.log(exercises[i].name);

		if(exercises[i].name == name)
		{
			console.log('found exercise ' + name);
			return exercises[i];
		}
	};

	return null;
}

help_showExerciseHelp = function(response, convo)
{
	console.log('HELP : showExerciseHelp : Lets look up help for ' + response.text);
	var exercise = getExercise(response.text);

	if(exercise != null)
	{
		console.log('HELP : showExerciseHelp : Found ' + exercise.name);
		convo.say('To do ' + exercise.name + ' do the following: ' + exercise.how);
		convo.next();
	}
	else
	{
		console.log('exercise is null');
	}
}

help_listCommands = function(response, convo)
{
	var msg = '';
	for (var i = exercises.length - 1; i >= 0; i--) {
		msg = msg + exercises[i].name;
		if(i>0)
			msg = msg + ', ';
	};
	convo.ask("To get help with an exercise reply with the {exercise name}.  Here are the exercises I will ask you to perform: " + msg, function(response, convo){
		help_showExerciseHelp(response, convo);
		convo.next();
	});
}

var logger = function()
{
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger() 
                        {
                            if(oldConsoleLog == null)
                                return;

                            console.log = oldConsoleLog;
                        };

    pub.disableLogger = function disableLogger()
                        {
                            oldConsoleLog = console.log;

                            var today = new Date();

                            console.log = function(msg) {
                            	var strDate = 'Y-mo-d-h:mi:s'
								  .replace('Y', today.getFullYear())
								  .replace('mo', today.getMonth()+1)
								  .replace('d', today.getDate())
								  .replace('h', today.getHours())
								  .replace('mi', today.getMinutes())
								  .replace('s', today.getSeconds());
                            	oldConsoleLog(strDate + ' - ' + msg);
                            };
                        };

    return pub;
}();

//use centralized logger
logger.disableLogger();
