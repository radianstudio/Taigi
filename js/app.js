(function() {
  $(function() {
    var Audio, Board, Data, GameController, Lib, Life, Main, Question, Score, Time;
    Lib = (function() {
      function Lib() {}

      Lib.prototype.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      Lib.prototype.strip = function(html) {
        var tmp;
        tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      return Lib;

    })();
    Score = (function() {
      var score;

      score = void 0;

      function Score(initScore) {
        if (initScore == null) {
          initScore = 0;
        }
        score = initScore;
      }

      Score.prototype.getScore = function() {
        return score;
      };

      Score.prototype.addScore = function(amount) {
        if (amount == null) {
          amount = 20;
        }
        score += amount;
      };

      return Score;

    })();
    Life = (function() {
      var $heart, life;

      life = void 0;

      $heart = $("#heart");

      function Life(life1) {
        this.life = life1;
      }

      Life.prototype.minus = function(num) {
        life -= num;
        return $heart.find('.heartCell');
      };

      Life.prototype.setLife = function() {};

      return Life;

    })();
    Time = (function() {
      var THIS, _time;

      THIS = void 0;

      Time.prototype.$timeView = $("#time");

      _time = void 0;

      function Time() {
        THIS = this;
      }

      Time.prototype.overTime = function() {};

      Time.prototype.resetTime = function(time) {
        if (time == null) {
          time = 30;
        }
        return _time = time;
      };

      Time.prototype.remainTime = function() {};

      Time.prototype.currentTime = function() {};

      return Time;

    })();
    Question = (function() {
      var $question, $sound, _answer, _getHtml, _question;

      $question = $('#question');

      $sound = $('#sound');

      _answer = void 0;

      _question = void 0;

      _getHtml = function(question, qIndex) {
        var _html, i, j, len, ref, w;
        _html = "";
        ref = question.split('');
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          w = ref[i];
          _html += "<div class=\"circle qWordCon\"><span class=\"qWord\">" + (i !== qIndex ? w : '') + "</span></div>";
        }
        return _html;
      };

      function Question(data) {}

      Question.prototype.showAnswer = function() {};

      Question.prototype.refresQuestion = function(question, qIndex, callback) {
        var $currentQuestion;
        $currentQuestion = $question.find('.qWordCon');
        return $.when($currentQuestion.fadeOut()).done(function() {
          $currentQuestion.remove();
          $(_getHtml(question, qIndex)).appendTo($question);
          if (typeof callback === 'function') {
            return callback();
          }
        });
      };

      return Question;

    })();
    Board = (function() {
      var $boardContainer, THIS, _answerIndex, _getBallonHtml, _processList;

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
        return "<div class=\"col-md-2\" >\n  <div class=\"ballon\" data-index=\"" + index + "\" data-hasWord=\"" + hasWord + "\">\n    <span>" + (word != null ? word : '') + "</span>\n  </div>\n</div>";
      };

      function Board() {
        THIS = this;
      }

      Board.prototype.checkAnswer = function(index) {
        var c;
        return c = index === _answerIndex;
      };

      Board.prototype.refreshBoard = function(optionList) {
        var finalList, html, i, j, len, results, w;
        _answerIndex = void 0;
        finalList = _processList(optionList);
        THIS.destruct();
        results = [];
        for (i = j = 0, len = finalList.length; j < len; i = ++j) {
          w = finalList[i];
          html = _getBallonHtml(w, i);
          console.log($boardContainer.length);
          results.push($(html).appendTo($boardContainer));
        }
        return results;
      };

      _processList = function(optionList) {
        var finalList, ran;
        finalList = new Array(50);
        while (optionList.length > 0) {
          console.log(optionList.length);
          ran = Lib.getRandomInt(0, 49);
          if (finalList[ran] != null) {
            continue;
          } else {
            if (_answerIndex == null) {
              _answerIndex = ran;
            }
            finalList[ran] = optionList.pop();
          }
        }
        console.log(finalList);
        return finalList;
      };

      Board.prototype.destruct = function() {
        return $boardContainer.find('.ballon').remove();
      };

      return Board;

    })();
    Audio = (function() {
      var $audio, $audioSrc;

      $audio = $("#sound");

      $audioSrc = $("#sound_src");

      function Audio() {}

      Audio.prototype.refreshSrc = function(url) {
        $audioSrc.attr('src', url);
        $audio[0].pause();
        return $audio[0].load();
      };

      Audio.prototype.play = function() {
        return $audio[0].play();
      };

      return Audio;

    })();
    Data = (function() {
      var _getMp3Process, _getOptionProcess, _getQuestionProcess, _initAjax;

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

      function Data() {
        _initAjax();
      }

      _getQuestionProcess = function(data) {
        var a, result, text;
        text = Lib.strip(data.responseText);
        console.log(text);
        a = text.split(":");
        return result = {
          question: a[0],
          qArr: a[0].split(""),
          pArr: a[1].split("-"),
          len: a[0].length,
          qIndex: a[0].length - 1
        };
      };

      Data.prototype.getQuestion = function(callback) {
        return $.ajax({
          type: 'get',
          dataType: 'text',
          url: 'http://14ef3e60.ngrok.io/q/get_question/',
          success: function(data, status) {
            console.log("Data.getQuestion", status);
            if (typeof callback === 'function') {
              return callback(_getQuestionProcess(data));
            }
          },
          error: function(e) {
            return console.log(e);
          }
        });
      };

      _getOptionProcess = function(data, ans) {
        var arr;
        arr = data.split(',');
        while (arr.indexOf(ans) !== -1) {
          arr.splice(ans, 1);
        }
        console.log("_getOptionProcess", arr);
        return arr.slice(0, 19);
      };

      Data.prototype.getOptionList = function(word, pronounce, callback) {
        return $.ajax({
          type: 'get',
          dataType: 'text',
          url: "http://14ef3e60.ngrok.io/q/close_pronounce/" + pronounce,
          success: function(data, status) {
            var optionList, text;
            text = Lib.strip(data.responseText);
            console.log('Data.getPronounce', status, text);
            optionList = _getOptionProcess(text, word);
            if (typeof callback === 'function') {
              return callback(optionList);
            }
          },
          error: function() {
            return console.log(e);
          }
        });
      };

      Data.prototype.getMp3 = function(word, callback) {
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
            return console.log(error);
          },
          success: function(data, status) {
            var url;
            console.log("Data.getMp3", status);
            url = _getMp3Process(data);
            console.log("Data.getMp3", 'url', url);
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
        return url = url.replace(/\\/g, '');
      };

      return Data;

    })();
    GameController = (function() {
      var THIS, Timer, _funcStatus, _initFuncStatus;

      THIS = void 0;

      Lib = new Lib();

      Data = new Data();

      Question = new Question();

      Board = new Board();

      Audio = new Audio();

      Timer = new Time();

      Life = new Life();

      Score = new Score();

      _funcStatus = void 0;

      _initFuncStatus = function() {
        var funcStatus;
        return funcStatus = {
          half: true,
          soundText: true,
          detail: true
        };
      };

      function GameController() {
        THIS = this;
        THIS.nextQuestion();
        _funcStatus = _initFuncStatus();
      }

      GameController.prototype.nextQuestion = function() {
        return Data.getQuestion(function(Q) {
          var answerWord;
          answerWord = Q.qArr[Q.qIndex];
          return Data.getOptionList(answerWord, Q.pArr[Q.qIndex], function(optionList) {
            optionList.push(answerWord);
            Board.refreshBoard(optionList);
            return Question.refresQuestion(Q.question, Q.qIndex, function() {
              return Data.getMp3(Q.question, function(url) {
                Audio.refreshSrc(url);
                return Audio.play();
              });
            });
          });
        });
      };

      GameController.prototype.hint = function(func) {
        var r;
        switch (func) {
          case 'half':
            r = true;
            break;
          case 'soundText':
            r = true;
            break;
          case 'detail':
            r = true;
        }
        return r;
      };

      GameController.prototype.minusLife = function(amount) {
        if (amount == null) {
          amount = 1;
        }
        return Life.minus(amount);
      };

      GameController.prototype.newGame = function() {
        THIS.nextQuestion();
        _funcStatusInit();
        Life = new Life();
        return Score = new Score();
      };

      GameController.prototype.addScore = function(amount) {
        if (amount == null) {
          amount = 20;
        }
        return Score.addScore(amount);
      };

      GameController.prototype.checkAnswer = function(index) {
        return Board.checkAnswer(index);
      };

      return GameController;

    })();
    Main = new GameController();
    $(document).on('click', '.ballon', function() {
      var $t;
      $t = $(this);
      $t.addClass('broke');
      if ($t.data('hasword') === true) {
        if (Main.checkAnswer($t.data('index'))) {
          alert('答對了');
          Main.addScore();
          return Main.nextQuestion();
        } else {
          alert('答錯了');
          return Main.minusLife();
        }
      }
    });
    return $(document).on('click', '.funcBtn', function() {
      if (Main.hint($(this).data('func'))) {
        return $(this).addClass('used disabled').prop('disabled', 'disabled');
      } else {
        return alert('這功能你已經用過了喔');
      }
    });
  });

}).call(this);
