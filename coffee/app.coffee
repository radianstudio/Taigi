$ ->
  class Lib
    constructor :()->
    getRandomInt : (min, max) ->
      Math.floor(Math.random() * (max - min + 1)) + min

    strip : (html) ->
      tmp = document.createElement('DIV')
      tmp.innerHTML = html
      tmp.textContent or tmp.innerText or ''


  class Score
    score = undefined
    constructor:(initScore = 0 )->
      score = initScore
    getScore : ()->
      score
    addScore : (amount = 20)->
      score += amount
      return

  class Life
    life = undefined
    $heart = $("#heart")

    constructor : (@life)->

    minus : (num)->
      life -= num
      $heart.find('.heartCell')

    setLife : ()->



  class Time
    THIS = undefined
    $timeView : $("#time")
    _time = undefined
    constructor:()->
      THIS = @
    overTime :()->
    resetTime :(time = 30)->
      _time = time
    remainTime :()->
    currentTime:()->


  class Question
    $question = $('#question')
    $sound = $('#sound')
    _answer = undefined
    _question = undefined

    _getHtml = (question,qIndex)->
      _html = ""
      for w , i in (question.split(''))
        _html+=
        """
          <div class="circle qWordCon"><span class="qWord">#{if i isnt qIndex then w  else ''}</span></div>
        """
      _html

    constructor :(data)->

    showAnswer:()->

    refresQuestion : (question,qIndex , callback)->
      $currentQuestion = $question.find('.qWordCon')
      $.when($currentQuestion.fadeOut()).done ()->
        $currentQuestion.remove()
        $(_getHtml(question,qIndex)).appendTo($question)
        callback() if typeof(callback) is 'function'


  class Board
    THIS = undefined
    _answerIndex = undefined
    $boardContainer = $("#ballonCon")

    _getBallonHtml = (word,index)->
      if word? then hasWord = true else hasWord = false

      """
        <div class="col-md-2" >
          <div class="ballon" data-index="#{index}" data-hasWord="#{hasWord}">
            <span>#{if word? then word else '' }</span>
          </div>
        </div>
      """

    constructor : ()->
      THIS = @

    checkAnswer:(index)-> # used on ballon on click
      c = index is _answerIndex

    refreshBoard :(optionList)-> # used by controller.
      _answerIndex = undefined ;
      finalList = _processList(optionList) ;

      THIS.destruct()

      for w , i in finalList # show new options on Board
        html = _getBallonHtml(w, i)
        console.log $boardContainer.length

        $(html).appendTo($boardContainer)

    _processList = (optionList)-> # 20 options to 50 ballon
      finalList = new Array(50)

      while (optionList.length > 0)
        console.log optionList.length
        ran = Lib.getRandomInt(0,49)
        if finalList[ran]?
          continue
        else
          _answerIndex = ran if not _answerIndex?
          finalList[ran] = optionList.pop()
      console.log(finalList)
      finalList



    destruct : ()->
      $boardContainer.find('.ballon').remove()#.addClass('broke')


  class Audio
    $audio = $("#sound")
    $audioSrc = $("#sound_src")
    constructor:()->

    refreshSrc : (url)->
      $audioSrc.attr('src',url)
      $audio[0].pause()
      $audio[0].load()

    play:()->
      $audio[0].play()


  class Data
    _initAjax = ()->
      jQuery.ajax = ((_ajax) ->
        protocol = location.protocol
        hostname = location.hostname
        exRegex = RegExp(protocol + '//' + hostname)
        YQL = 'http' + (if /^https/.test(protocol) then 's' else '') + '://query.yahooapis.com/v1/public/yql?callback=?'
        query = 'select * from html where url="{URL}" and xpath="*"'

        isExternal = (url) ->
          !exRegex.test(url) and /:\/\//.test(url)

        (o) ->
          url = o.url
          if /get/i.test(o.type) and !/json/i.test(o.dataType) and isExternal(url)
            # Manipulate options so that JSONP-x request is made to YQL
            o.url = YQL
            o.dataType = 'json'
            o.data =
              q: query.replace('{URL}', url + (if o.data then (if /\?/.test(url) then '&' else '?') + jQuery.param(o.data) else ''))
              format: 'xml'
            # Since it's a JSONP request
            # complete === success
            if !o.success and o.complete
              o.success = o.complete
              delete o.complete
            o.success = ((_success) ->
              (data) ->
                if _success
                  # Fake XHR callback.
                  _success.call this, { responseText: (data.results[0] or '').replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '') }, 'success'
                return
            )(o.success)
          _ajax.apply this, arguments
      )(jQuery.ajax)
    constructor : ()->
      _initAjax()

    _getQuestionProcess = (data)->


      # parse html to text
      text = Lib.strip(data.responseText)
      console.log text

      a = text.split(":")
      result =
        question : a[0]
        qArr : a[0].split("")
        pArr : a[1].split("-")
        len : a[0].length
        qIndex : a[0].length-1 # 這裏先暫時都以最後一個字挖空

    getQuestion : (callback)->
      $.ajax
        type: 'get'
        dataType: 'text'
        url: 'http://14ef3e60.ngrok.io/q/get_question/'
        success:(data,status)->
          console.log( "Data.getQuestion", status)
          callback(_getQuestionProcess(data)) if typeof(callback) is 'function'
        error : (e)->
          console.log(e)

    _getOptionProcess = (data,ans)->
      arr = data.split(',')
      while arr.indexOf(ans) isnt -1
        arr.splice(ans, 1);
      console.log("_getOptionProcess",arr)
      arr.slice(0,19)


    getOptionList : (word,pronounce,callback)->
      $.ajax
        type: 'get'
        dataType : 'text'
        url: "http://14ef3e60.ngrok.io/q/close_pronounce/#{pronounce}"
        success:(data,status)->
          text = Lib.strip(data.responseText)
          console.log('Data.getPronounce',status ,text )
          optionList = _getOptionProcess(text,word) ;
          callback(optionList) if typeof(callback) is 'function'
        error : ()->
          console.log(e)


    getMp3 : (word,callback)->
      $.ajax
        type: 'get'
        dataType: 'text'
        url: 'http://vois3.cyberon.com.tw/cloud_tts/gen_tts_file.php'
        data:
          esl_f0: '1'
          esl_gain: '1'
          esl_speaker: '1'
          esl_speed: '1'
          f0: '1'
          gain: '1'
          language: 'zh-NAN'
          outfmt: 'mp3'
          punctuDuration: '{"，":0.5,"。":1}'
          speaker: 'YiChuen'
          speed: '1'
          text: word
          vbr_quality: '1'
        error: (error) ->
          console.log error
        success: (data,status) ->
          console.log("Data.getMp3",status)
          url = _getMp3Process(data)
          console.log("Data.getMp3", 'url' , url)
          callback(url)

    _getMp3Process = (data)->
      str = data.responseText
      pos_head = str.search('http:')
      pos_tail = str.search('}')
      url = str.slice(pos_head, pos_tail - 1)
      url = url.replace(/\\/g, '')


  class GameController
    THIS = undefined

    Lib = new Lib()
    Data = new Data()

    Question = new Question()
    Board = new Board()
    Audio = new Audio()
    Timer = new Time()

    Life = new Life()
    Score = new Score()


    _funcStatus = undefined

    _initFuncStatus = ()->
      funcStatus =
        half : true
        soundText : true
        detail : true

    constructor : ()->
      THIS = @
      THIS.nextQuestion()
      _funcStatus = _initFuncStatus()

    nextQuestion : ()->
      Data.getQuestion (Q)->                        #  get question object
        answerWord = Q.qArr[Q.qIndex];              #  get the word which is answer


        Data.getOptionList answerWord ,Q.pArr[Q.qIndex] , (optionList)->
                                                    #get optionList by pron and ans.
          optionList.push(answerWord)               #  push answer to optionList
          Board.refreshBoard(optionList)            ## Board to next round
          Question.refresQuestion Q.question,Q.qIndex , ()->
            Data.getMp3 Q.question , (url)->            #  get mp3 by question
              Audio.refreshSrc(url);                    ## Audio to next round
              Audio.play()

                   ## Question to next round




    hint :(func)-> # the three treat function

      switch func
        when 'half'
          r = true
        when 'soundText'
          r = true
        when 'detail'
          r = true
      r
    minusLife : (amount = 1)->
      Life.minus(amount)

    newGame : ()->
      THIS.nextQuestion()
      _funcStatusInit()
      Life = new Life()
      Score = new Score()

    addScore : (amount = 20)->
      Score.addScore(amount)

    checkAnswer:(index)->
      Board.checkAnswer(index)

  Main = new GameController()

  $(document).on 'click','.ballon',()->
    $t = $(@)
    $t.addClass('broke')
    if $t.data('hasword') is true
      if Main.checkAnswer($t.data('index'))
        alert('答對了')
        Main.addScore()
        Main.nextQuestion()
      else
        alert('答錯了')
        Main.minusLife()
  $(document).on 'click','.funcBtn',()->
    if Main.hint($(@).data('func'))
      $(@).addClass('used disabled').prop('disabled','disabled')
    else
      alert '這功能你已經用過了喔'
