/* @*************************************************************************@
// @ Software author: JOOJ Team (JOOJ.us)							 @
// @ Author_url 1: https://jooj.us                       @
// @ Author_url 2: http://jooj.us/twitter-clone                      @
// @ Author E-mail: sales@jooj.us                                    @
// @*************************************************************************@
// @ JOOJ Talk - The Ultimate Modern Social Media Sharing Platform           @
// @ Copyright (c) 2020 - 2023 JOOJ Talk. All rights reserved.               @
// @*************************************************************************@
*/
var pubbox_form_app_mixin = Object({
    data: function() {
        return {
			expect : "expectation",
            text: "",
            prefix: "$<?php echo ($cl['prof_user']['username']); ?>",
            text_ph_orig: "<?php echo cl_translate('Hello, What is new with you today?'); ?>",
            text_ph: "",
            images: [],
            video: {},
            audio: {},
            music: {},
            document: {},
            poll: [],
            gifs_r1: [],
            gifs_r2: [],
            image_ctrl: true,
            video_ctrl: true,
            audio_ctrl: true,
            music_ctrl: true,
            poll_ctrl: true,
            doc_ctrl: true,
            gif_ctrl: true,
            submitting: false,
            active_media: null,
            gif_source: null,
            post_privacy: "everyone",
            og_imported: false,
            og_data: {},
            og_hidden: [],
            audio_rec: {
                context: false,
                recorder: false,
                is_recording: false,
                record_time: 0,
                record_ftime: "00:00",
                record_timeint: false,
                max_length: "<?php echo fetch_or_get($cl['config']['post_arec_length'], 30); ?>"
            },
            settings: {
                max_length: "<?php echo fetch_or_get($cl['config']['max_post_len'], 600); ?>",
                max_length_blue: "<?php echo fetch_or_get($cl['config']['max_post_len_blue'], 10000); ?>"
            },
            sdds: {
                privacy: {
                    everyone: "<?php echo cl_translate('Everyone can reply'); ?>",
                    mentioned: "<?php echo cl_translate('Only mentioned people'); ?>",
                    followers: "<?php echo cl_translate('Only my followers'); ?>",
                }
            },
            data_temp: {
                poll: {
                    title: "<?php echo cl_translate('Option - '); ?>",
                    value: ""
                }
            },
            emoticons_picker: {
                icons: window.cl_emoticons,
                status: false,
                active_group: "fused"
            },
            mentions: {
                users: [],
				pages: []
            },
            hashtags: {
                tags: []
            },
        };
    },
    computed: {
        valid_form: function() {
            var _app_ = this;

            if (_app_.active_media == 'image') {
                if (_app_.images.length >= 1 && cl_empty(_app_.submitting)) {
                    return true;
                }
                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'gifs') {
                if(cl_empty(_app_.gif_source) != true && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'video') {
                if($.isEmptyObject(_app_.video) != true && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'audio') {
                if($.isEmptyObject(_app_.audio) != true && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'music') {
                if($.isEmptyObject(_app_.music) != true && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'doc') {
                if($.isEmptyObject(_app_.document) != true && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if(_app_.active_media == 'poll') {
                if(_app_.text.length > 0 && _app_.valid_poll && cl_empty(_app_.submitting)) {
                    return true;
                }

                else {
                    return false;
                }
            }

            else if((_app_.active_media == null && _app_.text.length > 0) || _app_.og_imported) {
                return true;
            }

            else {
                return false;
            }
        },
        preview_audio: function() {
            if ($.isEmptyObject(this.audio)) {
                return false;
            }

            return true;
        },
        preview_music: function() {
            if ($.isEmptyObject(this.music)) {
                return false;
            }

            return true;
        },
        preview_doc: function() {
            if ($.isEmptyObject(this.document)) {
                return false;
            }

            return true;
        },
        gifs: function() {
            if (this.gifs_r1.length || this.gifs_r2.length) {
                return true;
            }

            return false;
        },
        show_og_data: function() {
            if (this.og_imported == true && this.active_media == null && this.og_hidden.contains(this.og_data.url) != true) {
                return true;
            }
            else {
                return false;
            }
        },
        valid_poll: function() {
            var _app_ = this;

            if (cl_empty(_app_.poll.length)) {
                return false;
            }

            else {
                for (var i = 0; i < _app_.poll.length; i++) {
                    if (cl_empty(_app_.poll[i].value)) {
                        return false;
                    }
                }

                return true;
            }
        }
    },
    methods: {
		handlePaste: function(event = false) {
			event.preventDefault();
			event.stopPropagation();
			const items = (event.clipboardData || window.clipboardData).items;
			if (items.length > 0) {
				if (items[0].kind === 'file') {
					let files = [];
					for (let i = 0; i < items.length; i++) {
						const item = items[i];
						if (item.kind === 'file') {
							const file = item.getAsFile();
							if (file) {
								files.push(file);
							} else {
								cl_bs_notify('Failed to retrieve file from clipboard', 3000, "danger");
							}
						}
					}
					this.uploadFiles_drop(files);
				} else {
					items[0].getAsString((text) => {
						const start = this.$refs.text_input.selectionStart;;
						const end = start;
						this.text = this.text.substring(0, start) + text + this.text.substring(end);
					}, (error) => {
						cl_bs_notify('Failed to get text from clipboard:', 3000, "danger");
					});
				}
			}
		},
		handleDrop: function(event) {
			event.preventDefault();
			event.stopPropagation();
			const files = event.dataTransfer.files;
			this.uploadFiles_drop(files);
		},
		uploadFiles_drop: function(files) {
			let type = 0;
			let valid = true;
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.type.startsWith('image/')) {
					if(type == 0) type = 1;
					else if(type == 2) valid = false;
				} else if (file.type.startsWith('video/')) {
					if(type == 0) type = 2;
					else if(type == 1) valid = false;
				}
				else valid = false;
			}
			if(!valid) cl_bs_notify("Files not valid. please select same types", 3000, "danger");
			else{
				if(type == 1) this.upload_images_drop(files);
				else this.upload_video_drop(files[0]);
			}
		},
		upload_images_drop: function(images = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);

			if (cl_empty(_app_.active_media) || _app_.active_media == 'image') {

				if (SMColibri.curr_pn == 'thread') {
	        		$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
	        	}

				SMColibri.progress_bar("show");

				if (images.length) {
					if(_app_.images.length + images.length < 5){
						for (var i = 0; i < images.length; i++) {
							if (SMColibri.max_upload(images[i].size)) {
								var form_data  = new FormData();
								var break_loop = false;
								form_data.append('delay', 1);
								form_data.append('image', images[i]);
								form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");
								
								$.ajax({
									url: '<?php echo cl_link("native_api/main/upload_page_image"); ?>',
									type: 'POST',
									dataType: 'json',
									enctype: 'multipart/form-data',
									data: form_data,
									cache: false,
									contentType: false,
									processData: false,
									timeout: 600000,
									beforeSend: function() {
										_app_.submitting = true;
									},
									success: function(data) {
										if (data.status == 200) {
											_app_.images.push(data.img);
										}
										else if(data.err_code == "total_limit_exceeded") {
											cl_bs_notify("<?php echo cl_translate('You cannot attach more than 4 images to this post.'); ?>", 3000, "danger");
											break_loop = true;
										}
										else {
											SMColibri.errorMSG();
										}
									},
									complete: function() {
										if (_app_.images.length && cl_empty(_app_.active_media)) {
											_app_.active_media = "image";
										}

										_app_.disable_ctrls();

										_app_.submitting = false;
									}
								});

								if (break_loop) {break;}
							}
						}
					}
					else {
						cl_bs_notify("You can't upload over 4 images!", 3000, "danger");
					}
				}

				setTimeout(function() {
					SMColibri.progress_bar("end");

					if (SMColibri.curr_pn == 'thread') {
		        		$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
		        	}
				}, 1500);

				app_el.find('input[data-an="images-input"]').val('');
			}
		},
		upload_video_drop: function(video = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);

			if (cl_empty(_app_.active_media)) {

				if (video && SMColibri.max_upload(video.size)) {

				    SMColibri.progress_bar("show");

					var form_data = new FormData();
					form_data.append('video', video);
					form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");

					$.ajax({
						url: '<?php echo cl_link("native_api/main/upload_post_video"); ?>',
						type: 'POST',
						dataType: 'json',
						enctype: 'multipart/form-data',
						data: form_data,
						cache: false,
						async: false,
				        contentType: false,
				        processData: false,
				        timeout: 600000,
				        beforeSend: function() {

				        	if (SMColibri.curr_pn == 'thread') {
				        		$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
				        	}
				        },
						success: function(data) {
							if (data.status == 200) {
								_app_.video = data.video;
							}
							else if(data.err_code == "total_limit_exceeded") {
								cl_bs_notify("<?php echo cl_translate('You cannot attach more than 1 video to this post.'); ?>", 3000, "danger");
							}
							else if(data.err_code == "test") {
								cl_bs_notify("<?php echo cl_translate('test error.'); ?>", 3000, "danger");
							}
							else {
								if (data.error) {
									cl_bs_notify(data.error, 3000, "danger");
								}
								else{
									SMColibri.errorMSG();
								}
							}
						},
						complete: function() {
							if ($.isEmptyObject(_app_.video) != true && cl_empty(_app_.active_media)) {
								_app_.active_media = "video";
							}

							_app_.disable_ctrls();
							app_el.find('input[data-an="video-input"]').val('');

							setTimeout(function() {
								SMColibri.progress_bar("end");

								if (SMColibri.curr_pn == 'thread') {
					        		$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
					        	}
							}, 1500);
						}
					});
				}
			}
		},
        text_input_trigger: function(e = false) {
            var _app_ = this;
            var mention_input = _app_.trigger_mentag_input("@");
            var hashtag_input = _app_.trigger_mentag_input("#");
			var page_input    = _app_.trigger_mentag_input("$");

            autosize($(e.target));

            if (mention_input) {
				var mentioned_user = mention_input.keyval;
	
				if (mentioned_user && mentioned_user.length > 0) {
					$.ajax({
						url: '<?php echo cl_link("native_api/main/mentions_autocomp"); ?>',
						type: 'GET',
						dataType: 'json',
						data: {username: mentioned_user}
					}).done(function(data) {
						if(data.status == 200) {
							_app_.mentions.users = data.users;
						}
						else {
							_app_.mentions.users = [];
						}
					});
				}
			}
			else if (hashtag_input) {
				var hashtag_val = hashtag_input.keyval;
	
				if (hashtag_val && hashtag_val.length > 0) {
					$.ajax({
						url: '<?php echo cl_link("native_api/main/hashtags_autocomp"); ?>',
						type: 'GET',
						dataType: 'json',
						data: {hashtag: hashtag_val}
					}).done(function(data) {
						if(data.status == 200) {
							_app_.hashtags.tags = data.tags;
						}
						else {
							_app_.destroy_mentag_autocomplete();
						}
					});
				}
			}
			else if (page_input) {
				var page_val = page_input.keyval;
	
				if (page_val && page_val.length > 0) {
					$.ajax({
						url: '<?php echo cl_link("native_api/main/pages_autocomp"); ?>',
						type: 'GET',
						dataType: 'json',
						data: {username: page_val}
					}).done(function(data) {
						if(data.status == 200) {
							_app_.mentions.pages = data.users;
						}
						else {
							_app_.mentions.pages = [];
						}
					});
				}
			}
		},
        text_blur_trigger: function(e = false) {
            var _app_ = this;

            if (this.text === this.prefix) {
                this.text = 'Share your thoughts on ' + this.prefix;
            }

            setTimeout(function() {
                _app_.destroy_mentag_autocomplete();
            }, 1500);
        },
        text_focus_trigger: function(e = false) {
			e.target.style.minHeight = "120px";
			if (this.text === '') {
				this.text = this.prefix + ' ';
			}
        },
        trigger_mentag_input: function(char = "@") {
            var _app_ = this;
            var input = _app_.$refs.text_input;
            var curspos = input.selectionStart;
            var input_val = input.value;
            var coords = {
                startIND: 0,
                endIND: 0,
                keyval: "",
                type: false
            };

            _app_.destroy_mentag_autocomplete();

            if (char == "@") {
                var start = input_val.substring(0, curspos).match(/\B@[a-zA-Z0-9_]+$/);
            }
            else if (char == "#") {
				var start = input_val.substring(0, curspos).match(/\B#\S+$/);
			}
			else if (char == "$") {
				var start = input_val.substring(0, curspos).match(/\B\$\S+$/);
			}
	
			if (start) {
				coords.startIND = start.index;
				coords.endIND   = (start.index += start[0].length);
				coords.keyval   = start[0];
				coords.type     = (char == "@") ? "mention" : (char == "#" ? "htag" : "page");
	
				return coords;
			}
			else {
				return false;
			}
        },
        mention_autocomplete: function(username = false) {
            var _app_ = this;
            var mt = _app_.trigger_mentag_input("@");
            var s1 = _app_.text.substring(0, mt.startIND);
            var s2 = _app_.text.substring(mt.endIND);

            _app_.text = ((s1 || "") + "@{0} ".format(username) + (s2 || ""));

            setTimeout(function() {
                _app_.destroy_mentag_autocomplete();
            }, 500);
        },
        hashtag_autocomplete: function(hashtag = false) {
            var _app_ = this;

            var ht = _app_.trigger_mentag_input("#");
            var s1 = _app_.text.substring(0, ht.startIND);
            var s2 = _app_.text.substring(ht.endIND);
            _app_.text = ((s1 || "") + "#{0} ".format(hashtag) + (s2 || ""));

            setTimeout(function() {
                _app_.destroy_mentag_autocomplete();
            }, 500);
        },
        page_autocomplete: function(page = false) {
			var _app_  = this;
			var pg     = _app_.trigger_mentag_input("$");
			var s1     = _app_.text.substring(0, pg.startIND);
			var s2     = _app_.text.substring(pg.endIND);
	
			_app_.text = ((s1 || "") + "${0} ".format(page) + (s2 || ""));
	
			setTimeout(function() {
				_app_.destroy_mentag_autocomplete();
			}, 500);
		},
		destroy_mentag_autocomplete: function() {
			var _app_ = this;
			_app_.mentions.users = [];
			_app_.hashtags.tags  = [];
			_app_.mentions.pages = []; 
		},
        emoticon_picker: function() {

            var _app_ = this;

            _app_.emoticons_picker.status = !_app_.emoticons_picker.status;
        },
        emoticon_insert: function(em = "") {
            var _app_ = this;
            var curs_pos = _app_.$refs.text_input.selectionStart;

            if ($.isNumeric(curs_pos) != true) {
                curs_pos = 0;
            }

            _app_.text = _app_.text.insert_at(curs_pos, em);
        },
        publish: function(_self = null) {
            _self.preventDefault();

            var form = $(_self.$el);
            var _app_ = this;

            $(_self.target).ajaxSubmit({
                url: "<?php echo cl_link('native_api/main/publish_new_post_symbol'); ?>",
                type: 'POST',
                dataType: 'json',
                data: {
                    gif_src: _app_.gif_source,
                    thread_id: ((_app_.thread_id) ? _app_.thread_id : 0),
                    curr_pn: SMColibri.curr_pn,
                    og_data: _app_.og_data,
                    privacy: _app_.post_privacy,
                    poll_data: _app_.poll,
                    symbol_id: form.find('input[name="symbol_id"]').val(),
                    text: _app_.text.replace(_app_.prefix, ''),
					expect: _app_.expect
                },
                beforeSend: function() {
                    _app_.submitting = true;
                },
                success: function(data) {
                    if (data.status == 200) {
                        
						var thread_timeline = $('div[data-app="symbol"]');
						var new_post        = $(data.html).addClass('animated fadeIn');

						if(!thread_timeline.find('div[data-an="entry-list"]').length) {
							thread_timeline.find('div[class="timeline-posts-container py-3"]').html('<div class="timeline-posts-ls" data-an="entry-list"></div>');
						}
						thread_timeline.find('div[data-an="entry-list"]').prepend(new_post).promise().done(function() {
							setTimeout(function() {
								thread_timeline.find('div[data-an="entry-list"]').find('[post-list-item]').first().removeClass('animated fadeIn');
							}, 1000);
						});

                        if($(_app_.$el).attr('id') == 'vue-pubbox-app-2') {
							_app_.reset_data();
                            $(_app_.$el).parents("div#add_new_post").modal('hide');
                        }
                        if($(_app_.$el).attr('id') == 'vue-pubbox-app-3') {
							_app_.reset_data();
                            $(_app_.$el).parents("div#add_new_post_reply").modal('hide');
                        }
                        if($(_app_.$el).attr('id') == 'vue-pubbox-app-repost') {				/* edited by kevin to show modal for repost (added)*/
							_app_.reset_data();
                            $(_app_.$el).parents("div#add_new_post_repost").modal('hide');
                        }						
						cl_bs_notify("<?php echo cl_translate('Your new publication has been posted on this coin page'); ?>", 5000);

                    }
                    else if(data.status == 400){						
                        cl_bs_notify(data.error, 3000, "danger");
					} 
					else{
                        _app_.submitting = false;
                        SMColibri.errorMSG();
                    }
                },
                complete: function() {
                    _app_.submitting = false;
                    _app_.reset_data();
                }
            });


		},
		
		
		
		create_poll: function() {
			var _app_ = this;

			if (cl_empty(_app_.active_media)) {
				if (_app_.poll_ctrl) {
					_app_.active_media = "poll";
					_app_.poll_option();
					_app_.poll_option();
					_app_.disable_ctrls();
				}
			}
		},
		poll_option: function() {
			var _app_ = this;

			if (_app_.poll.length < 4) {
				var poll_option_data = Object({
					title: _app_.data_temp.poll.title,
					value: _app_.data_temp.poll.value
				});

				_app_.poll.push(poll_option_data);
			}
			else{
				return false;
			}
		},
		cancel_poll: function() {
			var _app_          = this;
			_app_.active_media = null;
			_app_.poll         = [];

			_app_.disable_ctrls();
		},
		select_images: function() {
			var _app_ = this;

			if (_app_.active_media == 'image' || cl_empty(_app_.active_media)) {
				if (_app_.image_ctrl) {
					var app_el = $(_app_.$el);
					app_el.find('input[data-an="images-input"]').trigger('click');
				}
			}
		},
		select_video: function() {
			var _app_ = this;

			if (cl_empty(_app_.active_media)) {
				if (_app_.video_ctrl) {
					var app_el = $(_app_.$el);
					app_el.find('input[data-an="video-input"]').trigger('click');
				}
			}
		},
		select_music: function() {
			var _app_ = this;

			if (cl_empty(_app_.active_media)) {
				if (_app_.music_ctrl) {
					var app_el = $(_app_.$el);
					app_el.find('input[data-an="music-input"]').trigger('click');
				}
			}
		},
		select_doc: function() {
			var _app_ = this;

			if (cl_empty(_app_.active_media)) {
				if (_app_.doc_ctrl) {
					var app_el = $(_app_.$el);
					app_el.find('input[data-an="doc-input"]').trigger('click');
				}
			}
		},
		record_audio_start: function() {
			var _app_ = this;

			if (cl_empty(_app_.active_media) && _app_.audio_ctrl) {
				try {
					window.AudioContext     = (window.AudioContext || window.webkitAudioContext);
					navigator.getUserMedia  = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia);
					window.URL              = (window.URL || window.webkitURL);
					_app_.audio_rec.context = new AudioContext();

					navigator.getUserMedia({audio: true}, function(stream) {
						_app_.audio_rec.stream   = stream;
						_app_.audio_rec.recorder = new Recorder(_app_.audio_rec.context.createMediaStreamSource(stream), {
							type: "audio/mpeg"
						});

						_app_.audio_rec.recorder.record();
						_app_.audio_rec.is_recording = true;

						_app_.audio_rec.record_timeint = setInterval(function() {
							if (_app_.audio_rec.record_time < Number(_app_.audio_rec.max_length)) {
								_app_.audio_rec.record_time += 1;
								_app_.audio_rec.record_ftime = new Date(_app_.audio_rec.record_time * 1000).toISOString().substr(14, 5);
							}
							else{
								_app_.record_audio_stop();
							}
						}, 1000);

						_app_.active_media = "audio";
						_app_.disable_ctrls();

					}, function(e) {
				    	cl_bs_notify(e, 3000, "danger")
				    });
				} 
				catch (e) {
					cl_bs_notify(e, 3000, "danger");
				}
			}
		},
		record_audio_stop: function() {
			var _app_ = this;

			_app_.audio_rec.recorder.stop();
		
			_app_.audio_rec.is_recording = false;
			_app_.audio_rec.record_time  = 0;
			_app_.audio_rec.record_ftime = "00:00";

			clearInterval(_app_.audio_rec.record_timeint);

			_app_.audio_rec.recorder.exportWAV(function(blob) {
				
				var record_url = window.URL.createObjectURL(blob);
				var file_name  = "csm-{0}.mp3".format((new Date).toISOString().replace(/:|\./g, '_'));
		        var file_data  = new File([blob], file_name, {type: 'audio/mpeg'});
		       	var form_data  = new FormData();
			       	
			    if (SMColibri.max_upload(file_data.size)) {
			       	form_data.append('audio_file', file_data);

					$.ajax({
						url: '<?php echo cl_link("native_api/main/upload_post_arecord"); ?>',
						type: 'POST',
						dataType: 'json',
						enctype: 'multipart/form-data',
						data: form_data,
						cache: false,
				        contentType: false,
				        processData: false,
				        timeout: 600000,
					}).done(function(data) {
						if(data.status == 200){
							_app_.audio = data.audio;
						}
					}).always(function() {
						_app_.record_audio_finish();
					});
				}
				else{
					_app_.record_audio_finish();
					_app_.record_audio_reset();
				}
		    }, "audio/mpeg");
		},
		record_audio_finish: function() {
			var _app_ = this;
			_app_.audio_rec.recorder.clear();
			try{
				
				_app_.audio_rec.status   = 0;
				_app_.audio_rec.recorder = false;

				_app_.audio_rec.stream.getTracks().forEach(function(track) { 
					track.stop() 
				});
			}
			catch(e) {/*pass*/}
		},
		record_audio_reset: function() {
			var _app_ = this;

			_app_.active_media = null;
			_app_.disable_ctrls();
		},
		select_gifs: function() {
			var _app_ = this;
			var step  = false;

			if (cl_empty(_app_.active_media)) {
				$.ajax({
					url: 'https://api.giphy.com/v1/gifs/trending',
					type: 'GET',
					dataType: 'json',
					data: {
						api_key: '{%config giphy_api_key%}',
						limit: 50,
						lang: cl_get_ulang(),
						fmt: 'json'
					},
				}).done(function(data) {
					if (data.meta.status == 200 && data.data.length > 0) {
						for (var i = 0; i < data.data.length; i++) {
							if (step) {
								_app_.gifs_r1.push({
									thumb: data['data'][i]['images']['preview_gif']['url'],
									src: data['data'][i]['images']['original']['url'],
									title: data['data'][i]['title']
								});
							}
							else {
								_app_.gifs_r2.push({
									thumb: data['data'][i]['images']['preview_gif']['url'],
									src: data['data'][i]['images']['original']['url'],
									title: data['data'][i]['title']
								});
							}

							step = !step;
						}
					}
				}).always(function() {
					if (_app_.gifs && cl_empty(_app_.active_media)) {
						_app_.active_media = "gifs";
					}

					_app_.disable_ctrls();
				});
			}
		},
		search_gifs: function(_self = null) {
			if (_self.target.value.length >= 2) {
				var query   = $.trim(_self.target.value);
				var step    = false;
				var _app_   = this;
				var gifs_r1 = _app_.gifs_r1;
				var gifs_r2 = _app_.gifs_r2;

				$.ajax({
					url: 'https://api.giphy.com/v1/gifs/search',
					type: 'GET',
					dataType: 'json',
					data: {
						q: query,
						api_key:'{%config giphy_api_key%}',
						limit: 50,
						lang:'en',
						fmt:'json'
					}
				}).done(function(data) {
					if (data.meta.status == 200 && data.data.length > 0) {
						_app_.gifs_r1 = [];
						_app_.gifs_r2 = [];

						for (var i = 0; i < data.data.length; i++) {
							if (step) {
								_app_.gifs_r1.push({
									thumb: data['data'][i]['images']['preview_gif']['url'],
									src: data['data'][i]['images']['original']['url'],
								});
							}
							else {
								_app_.gifs_r2.push({
									thumb: data['data'][i]['images']['preview_gif']['url'],
									src: data['data'][i]['images']['original']['url'],
								});
							}

							step = !step;
						}
					}
					else {
						_app_.gifs_r1 = gifs_r1;
						_app_.gifs_r2 = gifs_r2;
					}
				});
			}
		},
		preview_gif: function(_self = null) {
			var _app_ = this;

			if (_self.target) {
				_app_.gif_source = $(_self.target).data('source');
			}
		},
		rm_preview_gif: function() {
			var _app_ = this;

			_app_.gif_source = null;
		},
		close_gifs: function() {
			var _app_          = this;
			_app_.gifs_r1      = [];
			_app_.gifs_r2      = [];
			_app_.active_media = null;
			_app_.disable_ctrls();
		},
		rm_gif_preloader(_self = null) {
			if (_self.target) {
				$(_self.target).siblings('div').remove();
				$(_self.target).parent('div').removeClass('loading');
			}
		},
		upload_images: function(event = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);
		
			if (cl_empty(_app_.active_media) || _app_.active_media == 'image') {
				var images = event.target.files;
		
				if (SMColibri.curr_pn == 'thread') {
					$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
				}
		
				SMColibri.progress_bar("show");
		
				if (images.length) {
					if(_app_.images.length + images.length < 5){
						for (var i = 0; i < images.length; i++) {
							if (SMColibri.max_upload(images[i].size)) {
								var form_data  = new FormData();
								var break_loop = false;
								form_data.append('delay', 1);
								form_data.append('image', images[i]);
								form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");
								
								$.ajax({
									url: '<?php echo cl_link("native_api/main/upload_page_image"); ?>',
									type: 'POST',
									dataType: 'json',
									enctype: 'multipart/form-data',
									data: form_data,
									cache: false,
									contentType: false,
									processData: false,
									timeout: 600000,
									beforeSend: function() {
										_app_.submitting = true;
									},
									success: function(data) {
										if (data.status == 200) {
											_app_.images.push(data.img);
										}
										else if(data.err_code == "total_limit_exceeded") {
											cl_bs_notify("<?php echo cl_translate('You cannot attach more than 4 images to this post.'); ?>", 3000, "danger");
											break_loop = true;
										}
										else {
											SMColibri.errorMSG();
										}
									},
									complete: function() {
										if (_app_.images.length && cl_empty(_app_.active_media)) {
											_app_.active_media = "image";
										}

										_app_.disable_ctrls();

										_app_.submitting = false;
									}
								});

								if (break_loop) {break;}
							}
						}
					}
					else {
						cl_bs_notify("You can't upload over 4 images!", 3000, "danger");
					}
				}
		
				setTimeout(function() {
					SMColibri.progress_bar("end");
		
					if (SMColibri.curr_pn == 'thread') {
						$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
					}
				}, 1500);
		
				app_el.find('input[data-an="images-input"]').val('');
			}
		},
		
		upload_video: function(event = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);

			if (cl_empty(_app_.active_media)) {
				var video  = event.target.files[0];

				if (video && SMColibri.max_upload(video.size)) {

				    SMColibri.progress_bar("show");

					var form_data = new FormData();
					form_data.append('video', video);
					form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");
					form_data.append('symbol_id', "<?php echo json_encode($cl['symbol_id']); ?>"); 
					$.ajax({
						url: '<?php echo cl_link("native_api/main/upload_post_video"); ?>',
						type: 'POST',
						dataType: 'json',
						enctype: 'multipart/form-data',
						data: form_data,
						cache: false,
						async: false,
				        contentType: false,
				        processData: false,
				        timeout: 600000,
				        beforeSend: function() {

				        	if (SMColibri.curr_pn == 'thread') {
				        		$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
				        	}
				        },
						success: function(data) {
							if (data.status == 200) {
								_app_.video = data.video;
							}
							else if(data.err_code == "total_limit_exceeded") {
								cl_bs_notify("<?php echo cl_translate('You cannot attach more than 1 video to this post.'); ?>", 1500, "danger");
							}
							else {
								if (data.error) {
									cl_bs_notify(data.error, 3000, "danger");
								}
								else{
									SMColibri.errorMSG();
								}
							}
						},
						complete: function() {
							if ($.isEmptyObject(_app_.video) != true && cl_empty(_app_.active_media)) {
								_app_.active_media = "video";
							}

							_app_.disable_ctrls();
							app_el.find('input[data-an="video-input"]').val('');

							setTimeout(function() {
								SMColibri.progress_bar("end");

								if (SMColibri.curr_pn == 'thread') {
					        		$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
					        	}
							}, 1500);
						}
					});
				}
			}
		},
		upload_music: function(event = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);

			if (cl_empty(_app_.active_media)) {
				var music  = event.target.files[0];

				if (music && SMColibri.max_upload(music.size)) {

				    SMColibri.progress_bar("show");

					var form_data = new FormData();
					form_data.append('music_file', music);
					form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");

					$.ajax({
						url: '<?php echo cl_link("native_api/main/upload_post_music"); ?>',
						type: 'POST',
						dataType: 'json',
						enctype: 'multipart/form-data',
						data: form_data,
						cache: false,
						async: false,
				        contentType: false,
				        processData: false,
				        timeout: 600000,
				        beforeSend: function() {
				        	if (SMColibri.curr_pn == 'thread') {
				        		$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
				        	}
				        },
						success: function(data) {
							if (data.status == 200) {
								_app_.music = data.music;
							}
							else if(data.err_code == "total_limit_exceeded") {
								cl_bs_notify("<?php echo cl_translate('You cannot attach more than 1 audio file to this post.'); ?>", 1500, "danger");
							}
							else {
								if (data.error) {
									cl_bs_notify(data.error, 3000, "danger");
								}
								else{
									SMColibri.errorMSG();
								}
							}
						},
						complete: function() {
							if ($.isEmptyObject(_app_.music) != true && cl_empty(_app_.active_media)) {
								_app_.active_media = "music";
							}

							_app_.disable_ctrls();
							app_el.find('input[data-an="music-input"]').val('');

							setTimeout(function() {
								SMColibri.progress_bar("end");

								if (SMColibri.curr_pn == 'thread') {
					        		$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
					        	}
							}, 1500);
						}
					});
				}
			}
		},
		upload_document: function(event = null) {
			var _app_  = this;
			var app_el = $(_app_.$el);

			if (cl_empty(_app_.active_media)) {
				var doc  = event.target.files[0];

				if (doc && SMColibri.max_upload(doc.size)) {

				    SMColibri.progress_bar("show");

					var form_data = new FormData();
					form_data.append('doc_file', doc);
					form_data.append('hash', "<?php echo fetch_or_get($cl['csrf_token'],'none'); ?>");

					$.ajax({
						url: '<?php echo cl_link("native_api/main/upload_post_document"); ?>',
						type: 'POST',
						dataType: 'json',
						enctype: 'multipart/form-data',
						data: form_data,
						cache: false,
						async: false,
				        contentType: false,
				        processData: false,
				        timeout: 600000,
				        beforeSend: function() {
				        	if (SMColibri.curr_pn == 'thread') {
				        		$('div[data-app="modal-pubbox"]').addClass('vis-hidden');
				        	}
				        },
						success: function(data) {
							if (data.status == 200) {
								_app_.document = data.document;
							}
							else if(data.err_code == "total_limit_exceeded") {
								cl_bs_notify("<?php echo cl_translate('You cannot attach more than 1 document file to this post.'); ?>", 1500, "danger");
							}
							else {
								if (data.error) {
									cl_bs_notify(data.error, 3000, "danger");
								}
								else{
									SMColibri.errorMSG();
								}
							}
						},
						complete: function() {
							if ($.isEmptyObject(_app_.document) != true && cl_empty(_app_.active_media)) {
								_app_.active_media = "doc";
							}

							_app_.disable_ctrls();
							app_el.find('input[data-an="doc-input"]').val('');

							setTimeout(function() {
								SMColibri.progress_bar("end");

								if (SMColibri.curr_pn == 'thread') {
					        		$('div[data-app="modal-pubbox"]').removeClass('vis-hidden');
					        	}
							}, 1500);
						}
					});
				}
			}
		},
		delete_image: function(id = null) {
			if (cl_empty(id)) {
				return false;
			}

			else {
				var _app_ = this;

				for (var i = 0; i < _app_.images.length; i++) {
					if (_app_.images[i]['id'] == id) {
						_app_.images.splice(i, 1);
					}
				}

				$.ajax({
					url: '<?php echo cl_link("native_api/main/delete_post_image"); ?>',
					type: 'POST',
					dataType: 'json',
					data: {image_id: id},
				}).done(function(data) {
					if (data.status != 200) {
						SMColibri.errorMSG();
					}
				}).always(function() {
					if (cl_empty(_app_.images.length)) {
						_app_.active_media = null;
					}

					_app_.disable_ctrls();
				});
			}
		},
		delete_video: function() {
			var _app_ = this;

			$.ajax({
				url: '<?php echo cl_link("native_api/main/delete_post_video"); ?>',
				type: 'POST',
				dataType: 'json',
			}).done(function(data) {
				if (data.status != 200) {
					SMColibri.errorMSG();
				}
				else {
					_app_.video = Object({});
				}
			}).always(function() {
				if ($.isEmptyObject(_app_.video)) {
					_app_.active_media = null;
				}

				_app_.disable_ctrls();
			});
		},
		delete_audio_file: function() {
			var _app_ = this;

			$.ajax({
				url: '<?php echo cl_link("native_api/main/delete_post_audiofile"); ?>',
				type: 'POST',
				dataType: 'json',
			}).done(function(data) {
				if (data.status != 200) {
					SMColibri.errorMSG();
				}
				else {
					_app_.audio = Object({});
					_app_.music = Object({});
				}
			}).always(function() {
				if ($.isEmptyObject(_app_.audio)) {
					_app_.active_media = null;
				}
				if ($.isEmptyObject(_app_.music)) {
					_app_.active_media = null;
				}

				_app_.disable_ctrls();
			});
		},
		delete_music: function() {
			var _app_ = this;

			_app_.delete_audio_file();
		},
		delete_document: function() {
			var _app_ = this;

			$.ajax({
				url: '<?php echo cl_link("native_api/main/delete_post_document"); ?>',
				type: 'POST',
				dataType: 'json',
			}).done(function(data) {
				if (data.status != 200) {
					SMColibri.errorMSG();
				}
				else {
					_app_.document = Object({});
				}
			}).always(function() {
				if ($.isEmptyObject(_app_.document)) {
					_app_.active_media = null;
				}

				_app_.disable_ctrls();
			});
		},
		delete_record: function() {
			var _app_ = this;

			_app_.delete_audio_file();
		},
		disable_ctrls: function() {
			var _app_ = this;

			if (_app_.active_media == 'image' && _app_.images.length >= 10) {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = false;
			}
			else if(_app_.active_media == 'image' && _app_.images.length < 10) {
				_app_.image_ctrl = true;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = false;
			}
			else if(_app_.active_media == 'audio') {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = true;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = false;
			}
			else if(_app_.active_media == 'music') {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = true;
				_app_.doc_ctrl   = false;
			}
			else if(_app_.active_media == 'doc') {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = true;
			}
			else if(_app_.active_media == 'video') {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = false;
				_app_.video_ctrl = true;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = false;
			}
			else if(_app_.active_media == 'gifs') {
				_app_.image_ctrl = false;
				_app_.gif_ctrl   = true;
				_app_.video_ctrl = false;
				_app_.poll_ctrl  = false;
				_app_.audio_ctrl = false;
				_app_.music_ctrl = false;
				_app_.doc_ctrl   = false;
			}
			else {
				_app_.image_ctrl = true;
				_app_.gif_ctrl   = true;
				_app_.video_ctrl = true;
				_app_.poll_ctrl  = true;
				_app_.audio_ctrl = true;
				_app_.music_ctrl = true;
				_app_.doc_ctrl   = true;
			}
		},
		reset_data: function() {
			var _app_ = this;

			if (_app_.active_media == "audio") {
				_app_.record_audio_reset();
			}

			_app_.expect       = "expectation";
			_app_.image_ctrl   = true;
			_app_.gif_ctrl     = true;
			_app_.poll_ctrl    = true;
			_app_.video_ctrl   = true;
			_app_.audio_ctrl   = true;
			_app_.music_ctrl   = true;
			_app_.doc_ctrl     = true;
			_app_.og_imported  = false;
			_app_.text         = "";
			_app_.images       = [];
			_app_.video        = Object({});
			_app_.document     = Object({});
			_app_.music        = Object({});
			_app_.audio        = Object({});
			_app_.og_data      = Object({});
			_app_.poll         = [];
			_app_.active_media = null;
			_app_.gif_source   = null;
			_app_.gifs_r1      = [];
			_app_.gifs_r2      = [];
			_app_.og_hidden    = [];
			_app_.emoticons_picker = Object({
				icons: _app_.emoticons_picker.icons,
				status: false,
				active_group: "people"
			});

			$(_app_.$refs.text_input).removeAttr("style");
		},
		rm_preview_og: function() {
			var _app_         = this;
			_app_.og_hidden.push(_app_.og_data.url);

			_app_.og_imported = false;
			_app_.og_data     = Object({});
		},
		cancel_post: function(){
			var _app_         = this;

			if (_app_.images != null && _app_.images.length > 0) {
				console.log(_app_.images.length);
				while(_app_.images.length > 0) {
					console.log(_app_.images[0]['id']);
					if (_app_.images[0] != null && _app_.images[0]['id'] != null) {
						_app_.delete_image(_app_.images[0]['id']);
					}
				}
			}

			if (_app_.audio != null && _app_.audio.length > 0) {
				_app_.delete_audio_file();
			}

			if (_app_.document != null && _app_.document.length > 0) {
				_app_.delete_document();
			}

			if (_app_.music != null && _app_.music.length > 0) {
				_app_.delete_music();
			}

			if (_app_.record != null && _app_.record.length > 0) {
				_app_.delete_record();
			}

			if (_app_.video != null && _app_.video.length > 0) {
				_app_.delete_video();
			}
			_app_.reset_data();
		},
	},
	updated: function() {
		var _app_ = this;

		delay(function() {
			if (_app_.og_imported != true) {
				var text_links = _app_.text.match(/(https?:\/\/[^\s]+)/);

				if (text_links && text_links.length > 0 && _app_.og_hidden.contains(text_links[0]) != true) {
					$.ajax({
						url: '<?php echo cl_link("native_api/main/import_og_data"); ?>',
						type: 'POST',
						dataType: 'json',
						data: {
							url: text_links[0]
						}
					}).done(function(data) {
						if (data.status == 200) {
							_app_.og_imported = true;
							_app_.og_data     = data.og_data;
						}
					});
				}
			}
		}, 800);


		if (_app_.active_media == "poll") {
			_app_.text_ph = "<?php echo cl_translate('Enter your question here'); ?>";
		}
		else {
			if (_app_.thread_id) {
				_app_.text_ph = "<?php echo cl_translate('Enter your reply here'); ?>";

				$('[data-app="modal-pubbox"]').find('h5[data-an="modal-title"]').text("<?php echo cl_translate('Post a reply'); ?>");
			}

			else{
				_app_.text_ph = _app_.text_ph_orig;

				$('[data-app="modal-pubbox"]').find('h5[data-an="modal-title"]').text("<?php echo cl_translate('New post'); ?>");
			}
		}
	},
	mounted: function() {
		var _app_ = this;
		_app_.$el.addEventListener('dragover', (event) => event.preventDefault());
		_app_.$el.addEventListener('drop', this.handleDrop);

		
		$("#add_new_post").on('hidden.bs.modal', this.cancel_post);
		$("#add_new_post_reply").on('hidden.bs.modal', this.cancel_post);
		$("#add_new_post_repost").on('hidden.bs.modal', this.cancel_post);
		$("#add_new_post_repost_symbol").on('hidden.bs.modal', this.cancel_post);
		$("#add_new_post").on('show.bs.modal', this.cancel_post);
		$("#add_new_post_reply").on('show.bs.modal', this.cancel_post);
		$("#add_new_post_repost").on('show.bs.modal', this.cancel_post);
		$("#add_new_post_repost_symbol").on('show.bs.modal', this.cancel_post);
		window.addEventListener('beforeunload', this.cancel_post);
		
		if (not_empty($me['draft_post'])){
			if ($(this.$el).attr('id') == 'vue-pubbox-app-1') {
				$.ajax({
					url: '<?php echo cl_link("native_api/main/get_draft_post"); ?>',
					type: 'GET',
					dataType: 'json'
				}).done(function(data) {
					if (data.status == 200 && data.type == "image") {
						_app_.images       = data.images;
						_app_.active_media = 'image';
					}
					else if(data.status == 200 && data.type == "video") {
						_app_.video        = data.video;
						_app_.active_media = 'video';
					}
					else if(data.status == 200 && data.type == "audio") {
						_app_.audio        = data.audio;
						_app_.active_media = 'audio';
					}
					else if(data.status == 200 && data.type == "document") {
						_app_.document     = data.document;
						_app_.active_media = 'doc';
					}
					else {
						return false;
					}

					if (data.status == 200) {
						cl_bs_notify("<?php echo cl_translate('Please finish editing the post or delete media files!'); ?>", 3000, "danger");
					}
				}).always(function() {
					_app_.disable_ctrls();
				});
			}
		}

		_app_.text_ph = _app_.text_ph_orig;
	}
});
