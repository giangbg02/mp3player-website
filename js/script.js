﻿(function($){
	// Settings
	var repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
                list = localStorage.list & 'false',
		continous = true,
		autoplay = true,
		playlist = [
{
title:'City\ Of\ Stars\ \-\ From\ \"La\ La\ Land\"\ Soundtrack',
artist:'Ryan\ Gosling\/Emma\ Stone',
album:'La\ La\ Land\ \(Original\ Motion\ Picture\ Soundtrack\)',
cover:'img\/Ryan\ Gosling\ \-\ City\ Of\ Stars\ \-\ From\ La\ La\ Land\ Soundtrack\.jpg',
mp3:'mp3\/Ryan\ Gosling\ \-\ City\ Of\ Stars\ \-\ From\ La\ La\ Land\ Soundtrack\.mp3',
ogg:'',
},
{
title:'My\ Love\(Radio\ Edit\)',
artist:'Westlife',
album:'Coast\ to\ Coast',
cover:'img\/Westlife\ \-\ My\ Love\(Radio\ Edit\)\.png',
mp3:'mp3\/Westlife\ \-\ My\ Love\(Radio\ Edit\)\.mp3',
ogg:'',
},
{
title:'\不\要\说\话',
artist:'\陈\奕\迅',
album:'\不\想\放\手',
cover:'img\/\陈\奕\迅\ \-\ \不\要\说\话\.jpg',
mp3:'mp3\/\陈\奕\迅\ \-\ \不\要\说\话\.mp3',
ogg:'',
},
];

	// Load playlist
	for (var i=0; i<playlist.length; i++){
                var pos = Math.floor(Math.random() * (playlist.length - i));
		var item = playlist[pos];
                var deletes = playlist.splice(pos, 1);
                //console.log(deletes);
                //console.log(playlist);
                playlist=playlist.concat(deletes);
		//$('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
	}
        var listing = function(value){
            if(list === 'true'){
              if($('#playlist li').length != playlist.length){
                  $('#playlist').empty();
                  for (var i=0; i<playlist.length; i++){
		      var item = playlist[i];                
		      $('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
	          }                 
                  $('#playlist li').each(function(i){
		      var _i = i;
		      $(this).on('click', function(){
                          currentTrack = _i;
			  switchTrack(currentTrack);
		      });
	          });            
              }  
              $('#playlist li').removeClass('playing').eq(value).addClass('playing');
            }
            else{
               var item = playlist[value];
               $('#playlist').empty();
               $('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
	       $('#playlist li').removeClass('playing').eq(0).addClass('playing');
            } 
        }

        

	var time = new Date(),
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		trigger = false,
		audio, timeout, isPlaying, playCounts;

	var play = function(){
		var playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                      // Automatic playback started!
                      // Show playing UI.
                    })
                  .catch(error => {
                      pause();
                      //setTimeout(function() { audio.play(); }, 500); 
                      });
                }
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 500);
		isPlaying = true;
	}

	var pause = function(){
		audio.pause();
		$('.playback').removeClass('playing');
		clearInterval(updateProgress);
		isPlaying = false;
	}

	// Update progress
	var setProgress = function(value){
		var currentSec = parseInt(value%60) < 10 ? '0' + parseInt(value%60) : parseInt(value%60),
			ratio = value / audio.duration * 100;

		$('.timer').html(parseInt(value/60)+':'+currentSec);
		$('.progress .pace').css('width', ratio + '%');
		$('.progress .slider a').css('left', ratio + '%');
	}

	var updateProgress = function(){
		setProgress(audio.currentTime);
	}

	// Progress slider
	$('.progress .slider').slider({step: 0.1, slide: function(event, ui){
		$(this).addClass('enable');
		setProgress(audio.duration * ui.value / 100);
		clearInterval(timeout);
	}, stop: function(event, ui){
		audio.currentTime = audio.duration * ui.value / 100;
		$(this).removeClass('enable');
		timeout = setInterval(updateProgress, 500);
	}});

	// Volume slider
	var setVolume = function(value){
		audio.volume = localStorage.volume = value;
		$('.volume .pace').css('width', value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	}

	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({max: 1, min: 0, step: 0.01, value: volume, slide: function(event, ui){
		setVolume(ui.value);
		$(this).addClass('enable');
		$('.mute').removeClass('enable');
	}, stop: function(){
		$(this).removeClass('enable');
	}}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function(){
		if ($(this).hasClass('enable')){
			setVolume($(this).data('volume'));
			$(this).removeClass('enable');
		} else {
			$(this).data('volume', audio.volume).addClass('enable');
			setVolume(0);
		}
	});

	// Switch track
	var switchTrack = function(i){
		if (i < 0){
			track = currentTrack = playlist.length - 1;
		} else if (i >= playlist.length){
			track = currentTrack = 0;
		} else {
			track = i;
		}

		$('audio').remove();
		loadMusic(track);
		if (isPlaying == true) play();
	}

	// Shuffle
	var shufflePlay = function(){
		var time = new Date(),
			lastTrack = currentTrack;
		currentTrack = time.getTime() % playlist.length;
		if (lastTrack == currentTrack) ++currentTrack;
		switchTrack(currentTrack);
	}

	// Fire when track ended
	var ended = function(){
		pause();
		audio.currentTime = 0;
		playCounts++;
		if (continous == true) isPlaying = true;
		if (repeat == 1){
			play();
		} else {
			if (shuffle === 'true'){
				shufflePlay();
			} else {
				if (repeat == 2){
					switchTrack(++currentTrack);
				} else {
					if (currentTrack < playlist.length) switchTrack(++currentTrack);
				}
			}
		}
	}

	var beforeLoad = function(){
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
	}

	// Fire when track loaded completely
	var afterLoad = function(){
		if (autoplay == true) play();
	}

	// Load track
	var loadMusic = function(i){
		var item = playlist[i],
			newaudio = $('<audio>').html('<source src="'+item.mp3+'"><source src="'+item.ogg+'">').appendTo('#player');
		
		$('.cover').html('<img src="'+item.cover+'" alt="'+item.album+'">');
		$('.tag').html('<strong>'+item.title+'</strong><span class="artist">'+item.artist+'</span><span class="album">'+item.album+'</span>');
                //$('#playlist').empty();
                //$('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
		//$('#playlist li').removeClass('playing').eq(0).addClass('playing');
                listing(i);
                
		audio = newaudio[0];
		audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
		audio.addEventListener('progress', beforeLoad, false);
		audio.addEventListener('durationchange', beforeLoad, false);
		audio.addEventListener('canplay', afterLoad, false);
		audio.addEventListener('ended', ended, false);
	}

	loadMusic(currentTrack);
        $(document).keydown(function(e){
                var e = e || window.event;
                if(e.keyCode==32){  //按键 space ASCII 码值  
                    if ($('.playback').hasClass('playing')){
			pause();
		    } else {
			play();
		    }
                    return false; 
                }
                else if(e.keyCode==37){  //按键 left arrow ASCII 码值  
                    if (shuffle === 'true'){
			shufflePlay();
		    } else {
			switchTrack(--currentTrack);
                    }
                }
                else if(e.keyCode==39){  //按键 right arrow ASCII 码值  
                    if (shuffle === 'true'){
			shufflePlay();
		    } else {
			switchTrack(++currentTrack);
                    }
                }
         });
	$('.playback').on('click', function(){
		if ($(this).hasClass('playing')){
			pause();
		} else {
			play();
		}
	});
	$('.rewind').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(--currentTrack);
		}
	});
	$('.fastforward').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(++currentTrack);
		}
	});       
	$('#playlist li').each(function(i){
		var _i = i;
		$(this).on('click', function(){
                        currentTrack = _i;
			switchTrack(currentTrack);
		});
	});

	if (shuffle === 'true') $('.shuffle').addClass('enable');
	if (repeat == 1){
		$('.repeat').addClass('once');
	} else if (repeat == 2){
		$('.repeat').addClass('all');
	}

	$('.repeat').on('click', function(){
		if ($(this).hasClass('once')){
			repeat = localStorage.repeat = 2;
			$(this).removeClass('once').addClass('all');
		} else if ($(this).hasClass('all')){
			repeat = localStorage.repeat = 0;
			$(this).removeClass('all');
		} else {
			repeat = localStorage.repeat = 1;
			$(this).addClass('once');
		}
	});

	$('.shuffle').on('click', function(){
		if ($(this).hasClass('enable')){
			shuffle = localStorage.shuffle = 'false';
			$(this).removeClass('enable');
		} else {
			shuffle = localStorage.shuffle = 'true';
			$(this).addClass('enable');
		}
	});
	$('.list').on('click', function(){
		if ($(this).hasClass('enable')){
			list = localStorage.list = 'false';
			$(this).removeClass('enable');
                        listing(currentTrack);
		} else {
			list = localStorage.list = 'true';
			$(this).addClass('enable');
                        listing(currentTrack);
		}
	});
})(jQuery);
