(function() {
  $(function() {
    var $document, GameController, Lib, Main, _Audio, _Board, _Data, _Lib, _Life, _Page, _Question, _Score, _Time;
    _Lib = (function() {
      function _Lib() {}

      _Lib.prototype.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      _Lib.prototype.strip = function(html) {
        var tmp;
        tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      _Lib.prototype.shuffle = function(o) {
        var i, j, x;
        j = void 0;
        x = void 0;
        i = o.length;
        while (i) {
          j = Math.floor(Math.random() * i);
          x = o[--i];
          o[i] = o[j];
          o[j] = x;
        }
        return o;
      };

      return _Lib;

    })();
    _Score = (function() {
      var Main, score;

      Main = void 0;

      score = void 0;

      function _Score(_Main, initScore) {
        if (initScore == null) {
          initScore = 0;
        }
        Main = _Main;
        score = initScore;
      }

      _Score.prototype.reset = function() {
        score = 0;
      };

      _Score.prototype.getScore = function() {
        return score;
      };

      _Score.prototype.addScore = function(amount) {
        if (amount == null) {
          amount = 1;
        }
        score += amount;
      };

      return _Score;

    })();
    _Life = (function() {
      var $heart, Main, THIS, _life, _max;

      Main = void 0;

      THIS = void 0;

      _max = 5;

      _life = void 0;

      $heart = $("#heart");

      function _Life(_Main, life) {
        if (life == null) {
          life = 5;
        }
        Main = _Main;
        THIS = this;
        _life = life;
        THIS.updateView(_life);
      }

      _Life.prototype.minus = function(num) {
        if (num == null) {
          num = 1;
        }
        _life -= num;
        return THIS.updateView(_life);
      };

      _Life.prototype.setLife = function(life) {
        if (life == null) {
          life = 5;
        }
        _life = life;
        return THIS.updateView(_life);
      };

      _Life.prototype.updateView = function(life) {
        var $collection, $h, done, i, k, ref, results;
        $collection = $("#heart .heartCell");
        results = [];
        for (i = k = 0, ref = _max; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          if (i < life) {
            results.push($collection.eq(i).toggleClass('hurt', false));
          } else {
            $h = $collection.eq(i);
            if (!$h.hasClass('hurt') && life === 0) {
              done = false;
              $h.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
                if (!done) {
                  Main.lose('die');
                  return done = true;
                }
              });
            }
            results.push($h.toggleClass('hurt', true));
          }
        }
        return results;
      };

      return _Life;

    })();
    _Time = (function() {
      var $timeTextView, $timeView, Main, THIS, _countLoop, _time, t;

      Main = void 0;

      THIS = void 0;

      $timeView = $("#time");

      $timeTextView = $("#timeText");

      _time = void 0;

      t = void 0;

      _countLoop = function() {
        _time = _time - 1;
        $timeTextView.text(_time);
        if (_time === 0) {
          THIS.timeOut();
        } else {
          t = setTimeout(_countLoop, 1000);
        }
      };

      function _Time(_Main) {
        Main = _Main;
        THIS = this;
      }

      _Time.prototype.start = function(time) {
        if (time == null) {
          time = 30;
        }
        THIS.stop();
        _time = time + 1;
        return _countLoop();
      };

      _Time.prototype.reStart = function(time) {
        if (time != null) {
          _time = time + 1;
        }
        THIS.stop();
        return _countLoop();
      };

      _Time.prototype.timeOut = function() {
        THIS.stop();
        alert('超過時間！損失一滴血，換一題。');
        return Main.wrongAns();
      };

      _Time.prototype.stop = function() {
        if (t != null) {
          return clearTimeout(t);
        }
      };

      _Time.prototype.remainTime = function() {
        return _time;
      };

      return _Time;

    })();
    _Question = (function() {
      var $question, $sound, Main, THIS, _answer, _currentAns, _getHtml, _question;

      THIS = void 0;

      Main = void 0;

      $question = $('#question');

      $sound = $('#sound');

      _answer = void 0;

      _question = void 0;

      _currentAns = {
        _ansWord: void 0,
        _ansPron: void 0,
        _ansIndex: void 0
      };

      _getHtml = function(question, pronounce, qIndex) {
        var _html, i, k, len, ref, w;
        _html = "";
        ref = question.split('');
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          w = ref[i];
          _html += "<div class=\"circle qWordCon\">\n  <div class=\"inner\">\n    <span class=\"qWord\">" + (i !== qIndex ? w : '*') + "</span>\n    <span class=\"qPron\">" + (i !== qIndex ? pronounce[i] : '...') + "</span>\n  </div>\n</div>";
        }
        return _html;
      };

      function _Question(_Main, data) {
        Main = _Main;
        THIS = this;
      }

      _Question.prototype.showAnsWord = function() {
        var $q;
        $q = $(".qWordCon").eq(_currentAns._ansIndex).find('.qWord').text(_currentAns._ansWord);
        return THIS.showAnsPron();
      };

      _Question.prototype.showAnsPron = function() {
        var $q;
        return $q = $(".qWordCon").eq(_currentAns._ansIndex).find('.qPron').text(_currentAns._ansPron);
      };

      _Question.prototype.refresQuestion = function(question, pronounce, qIndex, callback) {
        var $currentQuestion;
        _currentAns._ansIndex = qIndex;
        _currentAns._ansWord = question.charAt(qIndex);
        _currentAns._ansPron = pronounce[qIndex];
        $currentQuestion = $question.find('.qWordCon');
        return $.when($currentQuestion.fadeOut()).done(function() {
          $currentQuestion.remove();
          $(_getHtml(question, pronounce, qIndex)).appendTo($question);
          if (typeof callback === 'function') {
            return callback();
          }
        });
      };

      return _Question;

    })();
    _Board = (function() {
      var $boardContainer, Main, THIS, _answerIndex, _getBallonHtml, _processList;

      Main = void 0;

      THIS = void 0;

      _answerIndex = void 0;

      $boardContainer = $("#ballonCon");

      _getBallonHtml = function(word, index) {
        var hasWord;
        if (word != null) {
          hasWord = true;
        } else {
          hasWord = false;
        }
        return "<div class=\"col-md-2 ballon broke\" data-index=\"" + index + "\" data-hasWord=\"" + hasWord + "\">\n  <span>" + (word != null ? word : '') + "</span>\n</div>";
      };

      _processList = function(optionList) {
        var finalList;
        finalList = Lib.shuffle(optionList);
        return finalList;
      };

      function _Board(_Main) {
        Main = _Main;
        THIS = this;
      }

      _Board.prototype.half = function() {
        var $ballons, arr, eliminateArr, eliminateLength, k, length, results, v;
        $ballons = $boardContainer.find('.ballon');
        length = $ballons.length;
        eliminateLength = Math.floor(length / 2);
        arr = Lib.shuffle((function() {
          results = [];
          for (var k = 0; 0 <= length ? k <= length : k >= length; 0 <= length ? k++ : k--){ results.push(k); }
          return results;
        }).apply(this));
        eliminateArr = [];
        while (eliminateArr.length !== eliminateLength) {
          v = arr.shift();
          if (v !== _answerIndex) {
            eliminateArr.push(v);
          }
        }
        console.info('int:half.', "eliminateArr", eliminateArr, '_answerIndex', _answerIndex);
        return $ballons.each(function(i, obj) {
          var $this;
          $this = $(this);
          if (eliminateArr.indexOf(parseInt($this.data('index'))) !== -1) {
            return $this.addClass('broke');
          }
        });
      };

      _Board.prototype.checkAnswer = function(index) {
        var c;
        return c = index === _answerIndex;
      };

      _Board.prototype.refreshBoard = function(answerWord, optionList) {
        var finalList;
        _answerIndex = void 0;
        finalList = _processList(optionList);
        _answerIndex = optionList.indexOf(answerWord);
        return THIS.destruct(function() {
          var html, i, k, len, w;
          for (i = k = 0, len = finalList.length; k < len; i = ++k) {
            w = finalList[i];
            html = _getBallonHtml(w, i);
            $(html).appendTo($boardContainer);
          }
          return setTimeout((function() {
            return $boardContainer.find('.ballon').removeClass('broke');
          }), 100);
        });
      };

      _Board.prototype.destruct = function(callback) {
        var $collection;
        $collection = $boardContainer.find('.col-md-2');
        if ($collection.length === 0) {
          if (callback != null) {
            return callback();
          }
        } else {
          setTimeout((function() {
            $collection.remove();
            if (callback != null) {
              return callback();
            }
          }), 800);
          return $("#ballonCon .ballon").addClass('broke');
        }
      };

      return _Board;

    })();
    _Audio = (function() {
      var $audio, $audioSrc, Main;

      Main = void 0;

      $audio = $("#sound");

      $audioSrc = $("#sound_src");

      function _Audio(_Main) {
        Main = _Main;
      }

      _Audio.prototype.refreshSrc = function(url) {
        $audioSrc.attr('src', url);
        $audio[0].pause();
        return $audio[0].load();
      };

      _Audio.prototype.play = function() {
        return $audio[0].play();
      };

      _Audio.prototype.checkSrc = function() {
        return $audioSrc.attr('src').length > 3;
      };

      return _Audio;

    })();
    _Data = (function() {
      var Main, THIS, _getMp3Process, _getOptionProcess, _getQuestionProcess, _initAjax;

      THIS = void 0;

      Main = void 0;

      _initAjax = function() {
        return jQuery.ajax = (function(_ajax) {
          var YQL, exRegex, hostname, isExternal, protocol, query;
          protocol = location.protocol;
          hostname = location.hostname;
          exRegex = RegExp(protocol + '//' + hostname);
          YQL = 'http' + (/^https/.test(protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql?callback=?';
          query = 'select * from html where url="{URL}" and xpath="*"';
          isExternal = function(url) {
            return !exRegex.test(url) && /:\/\//.test(url);
          };
          return function(o) {
            var url;
            url = o.url;
            if (/get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url)) {
              o.url = YQL;
              o.dataType = 'json';
              o.data = {
                q: query.replace('{URL}', url + (o.data ? (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data) : '')),
                format: 'xml'
              };
              if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
              }
              o.success = (function(_success) {
                return function(data) {
                  if (_success) {
                    _success.call(this, {
                      responseText: (data.results[0] || '').replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                    }, 'success');
                  }
                };
              })(o.success);
            }
            return _ajax.apply(this, arguments);
          };
        })(jQuery.ajax);
      };

      function _Data(_Main) {
        THIS = this;
        Main = _Main;
        _initAjax();
      }

      _Data.prototype.prepareQuestion = function(callback) {
        var _return, dataToShow;
        dataToShow = {};
        _return = function() {
          if ((callback != null) && (dataToShow.optionList != null) && (dataToShow.audioUrl != null)) {
            console.info('prepareQuestion success', dataToShow.question, dataToShow.audioUrl);
            return callback(dataToShow);
          }
        };
        console.log('prepareQuestion ing ...');
        return THIS.getQuestion(function(Q) {
          dataToShow.question = Q.question;
          dataToShow.pronounce = Q.pArr;
          dataToShow.qIndex = Q.qIndex;
          dataToShow.answerWord = Q.qArr[Q.qIndex];
          THIS.getOptionList(dataToShow.answerWord, Q.pArr[Q.qIndex], function(optionList) {
            if (optionList.length < 20) {
              console.warn('選項文字串長度不及20', optionList.length);
            }
            dataToShow.optionList = optionList;
            return _return();
          });
          return THIS.getMp3(Q.question, function(url) {
            if (url.length < 2) {
              console.warn("抓不到[" + Q.question + "]的發音Mp3", dataToShow.audioUrl);
            }
            dataToShow.audioUrl = url;
            return _return();
          });
        });
      };

      _getQuestionProcess = function(data) {
        var a, result, text;
        text = Lib.strip(data.responseText);
        if (text.length === 0) {
          text = "風水:hong-suí";
        }
        a = text.split(":");
        return result = {
          question: a[0],
          qArr: a[0].split(""),
          pArr: a[1].split("-"),
          len: a[0].length,
          qIndex: Lib.getRandomInt(0, a[0].length - 1)
        };
      };

      _Data.prototype.getQuestion = function(callback) {
        return $.ajax({
          type: 'get',
          dataType: 'text',
          url: 'http://4100a232.ngrok.io/q/get_question/',
          success: function(data, status) {
            if (typeof callback === 'function') {
              return callback(_getQuestionProcess(data));
            }
          },
          error: function(e) {
            return console.warn("getQuestion, ajax error", e);
          }
        });
      };

      _getOptionProcess = function(data, ans) {
        var arr, i;
        if (data.length === 0) {
          data = "金,天,氣,不,錯,只,是,有,一,點,飄,雨";
          console.warn('getOption no response');
        }
        arr = data.split(',');
        while ((i = arr.indexOf(ans)) !== -1) {
          arr.splice(i, 1);
        }
        while ((i = arr.indexOf("")) !== -1) {
          arr.splice(i, 1);
        }
        arr = arr.slice(0, 19);
        arr.push(ans);
        return arr;
      };

      _Data.prototype.getOptionList = function(word, pronounce, callback) {
        return $.ajax({
          type: 'get',
          dataType: 'text',
          url: "http://4100a232.ngrok.io/q/close_pronounce/" + pronounce,
          success: function(data, status) {
            var optionList, text;
            text = Lib.strip(data.responseText);
            optionList = _getOptionProcess(text, word);
            if (typeof callback === 'function') {
              return callback(optionList);
            }
          },
          error: function() {
            return console.warn("getOptionList , ajax error ", e);
          }
        });
      };

      _Data.prototype.getMp3 = function(word, callback) {
        return $.ajax({
          type: 'get',
          dataType: 'text',
          url: 'http://vois3.cyberon.com.tw/cloud_tts/gen_tts_file.php',
          data: {
            esl_f0: '1',
            esl_gain: '1',
            esl_speaker: '1',
            esl_speed: '1',
            f0: '1',
            gain: '1',
            language: 'zh-NAN',
            outfmt: 'mp3',
            punctuDuration: '{"，":0.5,"。":1}',
            speaker: 'YiChuen',
            speed: '1',
            text: word,
            vbr_quality: '1'
          },
          error: function(error) {
            return console.warn("getMp3 , ajax error", error);
          },
          success: function(data, status) {
            var url;
            url = _getMp3Process(data);
            return callback(url);
          }
        });
      };

      _getMp3Process = function(data) {
        var pos_head, pos_tail, str, url;
        str = data.responseText;
        pos_head = str.search('http:');
        pos_tail = str.search('}');
        url = str.slice(pos_head, pos_tail - 1);
        url = url.replace(/\\/g, '');
        return url;
      };

      return _Data;

    })();
    _Page = (function() {
      var $loseModal, $startModal, $winModal, Main, THIS;

      THIS = void 0;

      Main = void 0;

      $startModal = $("#startModal");

      $loseModal = $("#loseModal");

      $winModal = $('#winModal');

      $(document).on('click', '#loseModal .restart', function() {
        $loseModal.modal('hide');
        return Main.newGame();
      });

      $(document).on('click', '#startBtn', function() {
        Main.newGame();
        return $startModal.modal('hide');
      });

      function _Page(_Main) {
        THIS = this;
        Main = _Main;
        $('#startBtn').css('opacity', .7).prop('disabled', true);
        $startModal.modal({
          'backdrop': 'static'
        });
        $loseModal.show = function(howStr, score) {
          $loseModal.find('.how').text(howStr);
          $loseModal.find('.score').text(score);
          return $loseModal.modal({
            'backdrop': 'static',
            'keyboard': false
          });
        };
      }

      _Page.prototype.$winModal = $winModal;

      _Page.prototype.$loseModal = $loseModal;

      return _Page;

    })();
    GameController = (function() {
      var Audio, Board, Data, Life, Page, Question, Score, THIS, Timer, _funcStatus, _initFuncStatus, _initSubControllers, gamming, questionDataList;

      THIS = void 0;

      Data = void 0;

      Question = void 0;

      Board = void 0;

      Audio = void 0;

      Timer = void 0;

      Life = void 0;

      Score = void 0;

      Page = void 0;

      _funcStatus = {};

      questionDataList = [];

      gamming = false;

      _initFuncStatus = function() {
        $('.funcBtn').removeClass('used');
        return _funcStatus = {
          half: true,
          pron: true,
          skip: true
        };
      };

      _initSubControllers = function(_this) {
        Data = new _Data(_this);
        Question = new _Question(_this);
        Board = new _Board(_this);
        Audio = new _Audio(_this);
        Timer = new _Time(_this);
        Life = new _Life(_this);
        Score = new _Score(_this);
        return Page = new _Page(_this);
      };

      GameController.prototype.prepareQuesiton = function(wellPreparedCallback) {
        if ((wellPreparedCallback != null) && questionDataList.length === 1) {
          wellPreparedCallback();
        }
        if (questionDataList.length < 2) {
          return Data.prepareQuestion(function(dataToShow) {
            questionDataList.push(dataToShow);
            return THIS.prepareQuesiton(wellPreparedCallback);
          });
        }
      };

      function GameController() {
        THIS = this;
        _initSubControllers(THIS);
        THIS.prepareQuesiton(function() {
          return $('#startBtn').css('opacity', 1).prop('disabled', false);
        });
      }

      GameController.prototype.nextQuestion = function() {
        var data;
        if (questionDataList.length !== 0) {
          data = questionDataList.shift();
          THIS.prepareQuesiton();
          Timer.start();
          Board.refreshBoard(data.answerWord, data.optionList);
          Audio.refreshSrc(data.audioUrl);
          return Question.refresQuestion(data.question, data.pronounce, data.qIndex, function() {
            return Audio.play();
          });
        } else {
          return console.error("已經沒有準備好的題目了，這不應該發生");
        }
      };

      GameController.prototype.playSound = function() {
        console.log(Audio);
        if (Audio.checkSrc()) {
          Audio.play();
          return true;
        } else {
          return false;
        }
      };

      GameController.prototype.hint = function(func) {
        var able;
        able = _funcStatus[func];
        console.log(_funcStatus, able, func);
        if (able) {
          _funcStatus[func] = false;
          switch (func) {
            case 'half':
              Board.half();
              break;
            case 'skip':
              Main.nextQuestion();
              break;
            case 'pron':
              Question.showAnsPron();
              break;
            default:
              console.warn('沒有處理的提示功能', func);
          }
        }
        return able;
      };

      GameController.prototype.wrongAns = function() {
        Question.showAnsWord();
        Life.minus(1);
        return setTimeout((function() {
          return Main.nextQuestion();
        }), 1500);
      };

      GameController.prototype.rightAns = function() {
        Question.showAnsWord();
        Score.addScore(1);
        return setTimeout((function() {
          return Main.nextQuestion();
        }), 1500);
      };

      GameController.prototype.newGame = function() {
        if (!gamming) {
          THIS.nextQuestion();
          _initFuncStatus();
          Life.setLife();
          Score.reset();
          return gamming = true;
        }
      };

      GameController.prototype.checkAnswer = function(index) {
        return Board.checkAnswer(index);
      };

      GameController.prototype.lose = function(how) {
        var howStr;
        gamming = false;
        howStr = void 0;
        Timer.stop();
        switch (how) {
          case 'die':
            howStr = "你失去所有生命值..";
            break;
          case 'timeout':
            howStr = "你沒有在時間內完成答題..";
        }
        return Page.$loseModal.show(howStr, Score.getScore());
      };

      return GameController;

    })();
    Lib = new _Lib();
    Main = new GameController();
    $document = $(document);
    $document.on('click', '.ballon', function() {
      var $t;
      $t = $(this);
      if ($t.hasClass('broke')) {
        return false;
      }
      $t.addClass('broke');
      if ($t.data('hasword') === true) {
        if (Main.checkAnswer($t.data('index'))) {
          alert('答對了');
          return Main.rightAns();
        } else {
          alert('答錯了');
          return Main.wrongAns();
        }
      }
    });
    $document.on('click', '.funcBtn', function() {
      if (Main.hint($(this).data('func'))) {
        return $(this).addClass('used');
      } else {
        return alert('這功能你已經用過了喔');
      }
    });
    return $document.on('click', '.soundClickSpan', function() {
      if (!Main.playSound()) {
        return alert('後端抓不到發音的音訊');
      }
    });
  });

}).call(this);
