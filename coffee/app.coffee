$ ->
  class _Lib
    constructor :()->
    getRandomInt : (min, max) ->
      Math.floor(Math.random() * (max - min + 1)) + min

    strip : (html) ->
      tmp = document.createElement('DIV')
      tmp.innerHTML = html
      tmp.textContent or tmp.innerText or ''

    shuffle : (o) ->
      j = undefined
      x = undefined
      i = o.length
      while i
        j = Math.floor(Math.random() * i)
        x = o[--i]
        o[i] = o[j]
        o[j] = x
      o

  class _Score
    Main = undefined
    score = undefined
    constructor:(_Main , initScore = 0 )->
      Main = _Main
      score = initScore
    reset : -> score = 0 ; return ;
    getScore : -> score
    addScore : (amount = 1)->
      score += amount
      return

  class _Life
    Main = undefined
    THIS = undefined
    _max = 5
    _life = undefined
    $heart = $("#heart")

    constructor : (_Main , life = 5)->
      Main = _Main
      THIS = @
      _life = life
      THIS.updateView(_life)
    minus : (num = 1)->
      _life -= num

      THIS.updateView(_life)

    setLife : (life)->
      _life = life
      THIS.updateView(_life)
    updateView : (life) ->
      # alert('updateView')
      $collection = $("#heart .heartCell")
      for i in [0..._max]
        if i < life
          $collection.eq(i).toggleClass('hurt',false)
        else # 當 i 大於等於生命值時，代表他應該隱藏了
          $h = $collection.eq(i)
          if not $h.hasClass('hurt') and life is 0
            done =false
            $h.one 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd' , (e)->
              if not done
                Main.lose('die')
                done = true
          $h.toggleClass('hurt',true)


  class _Time
    Main = undefined
    THIS = undefined
    $timeView = $("#time")
    $timeTextView = $("#timeText")
    _time = undefined
    t = undefined

    _countLoop = ()->

      _time = _time - 1
      $timeTextView.text _time
      if _time is 0
        THIS.timeOut()
      else
        t = setTimeout _countLoop, 1000
        # console.log('t',t);
      return

    constructor:(_Main)->
      Main = _Main
      THIS = @

    start : (time = 30)->
      THIS.stop()
      _time = time + 1
      _countLoop()
      #console.log(t)
    reStart : (time)->
      _time = time + 1 if time?
      THIS.stop()
      _countLoop()

    timeOut:()->
      THIS.stop()
      Main.lose('timeout')
    stop : ()->
      # console.log('t',t)
      if t? then clearTimeout t
      # console.log(t)
    remainTime :()->
      return _time


  class _Question
    Main = undefined
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

    constructor :(_Main , data)->
      Main = _Main
    showAnswer:()->

    refresQuestion : (question,qIndex , callback)->
      $currentQuestion = $question.find('.qWordCon')
      $.when($currentQuestion.fadeOut()).done ()->
        $currentQuestion.remove()
        $(_getHtml(question,qIndex)).appendTo($question)
        callback() if typeof(callback) is 'function'


  class _Board
    Main = undefined
    THIS = undefined
    _answerIndex = undefined
    $boardContainer = $("#ballonCon")

    _getBallonHtml = (word,index)->
      if word? then hasWord = true else hasWord = false

      """
        <div class="col-md-2 ballon broke" data-index="#{index}" data-hasWord="#{hasWord}">
          <span>#{if word? then word else '' }</span>
        </div>
      """

    _processList = (optionList)-> # 20 options to 20 ballon
      finalList = Lib.shuffle(optionList)
      # console.log(finalList)
      return finalList

    constructor : (_Main)->
      Main = _Main
      THIS = @

    half : ()->
      $ballons = $boardContainer.find('.ballon')
      length = $ballons.length
      eliminateLength = Math.floor(length/2)
      arr = Lib.shuffle([0..length])

      eliminateArr = []
      while eliminateArr.length isnt eliminateLength
        v = arr.shift()
        eliminateArr.push(v) if v isnt _answerIndex
      console.info('int:half.',"eliminateArr",eliminateArr,'_answerIndex',_answerIndex)
      $ballons.each (i,obj)->
        $this = $(this)
        $this.addClass('broke') if eliminateArr.indexOf(parseInt($this.data('index'))) isnt -1

    checkAnswer:(index)-> # used on ballon on click
      c = index is _answerIndex

    refreshBoard :(answerWord , optionList) -> # used by controller.
      # console.info("refreshBoard")
      _answerIndex = undefined ;
      # console.log("refreshBoard 的 optionList:" , optionList)
      finalList = _processList(optionList) ;

      _answerIndex = optionList.indexOf(answerWord)
      THIS.destruct ->
        # console.log("showing")
        for w , i in finalList # show new options on Board
          html = _getBallonHtml(w, i)
          $(html).appendTo($boardContainer)

        setTimeout (-> $boardContainer.find('.ballon').removeClass('broke')),100

    destruct : (callback)->
      $collection = $boardContainer.find('.col-md-2')
      if $collection.length is 0
        callback() if callback?
      else
        setTimeout (()->
          $collection.remove()
          callback() if callback?
        ),800




        $("#ballonCon .ballon").addClass('broke')






  class _Audio
    Main = undefined
    $audio = $("#sound")
    $audioSrc = $("#sound_src")
    constructor:(_Main)->
      Main = _Main

    refreshSrc : (url)->
      $audioSrc.attr('src',url)
      $audio[0].pause()
      $audio[0].load()

    play:()->
      $audio[0].play()

    checkSrc : -> $audioSrc.attr('src').length > 3




  class _Data
    THIS = undefined
    Main = undefined

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
    constructor : (_Main)->
      THIS = @ ;
      Main = _Main
      _initAjax()

    prepareQuestion : (callback)->
      dataToShow = {}
      _return = ()->

        if callback? and dataToShow.optionList? and dataToShow.audioUrl?
          console.info('prepareQuestion success', dataToShow.question,dataToShow.audioUrl);
          # console.log(dataToShow)
          callback(dataToShow)
      console.log('prepareQuestion ing ...')
      THIS.getQuestion (Q)->                        #  get question object
        dataToShow.question = Q.question
        dataToShow.qIndex = Q.qIndex
        dataToShow.answerWord = Q.qArr[Q.qIndex];              #  get the word which is answer
        THIS.getOptionList dataToShow.answerWord ,Q.pArr[Q.qIndex] , (optionList)->
          console.warn('選項文字串長度不及20',optionList.length) if optionList.length < 20
          dataToShow.optionList = optionList
          _return()
        THIS.getMp3 Q.question , (url)->            #  get mp3 by question
          if (url.length < 2) then console.warn "抓不到[#{Q.question}]的發音Mp3", dataToShow.audioUrl
          dataToShow.audioUrl = url
          _return()



    _getQuestionProcess = (data)->
      # parse html to text
      text = Lib.strip(data.responseText)
      # console.log text

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
          # console.log( "Data.getQuestion", status)
          callback(_getQuestionProcess(data)) if typeof(callback) is 'function'
        error : (e)->
          console.warn("getQuestion, ajax error",e)

    _getOptionProcess = (data,ans)->
      arr = data.split(',')
      while arr.indexOf(ans) isnt -1
        arr.splice(ans, 1);
      while arr.indexOf("") isnt -1
        arr.splice("", 1)
      arr = arr.slice(0,19)
      # console.log("_getOptionProcess",arr)
      arr.push(ans) #  push answer to optionList
      return arr


    getOptionList : (word,pronounce,callback)->
      $.ajax
        type: 'get'
        dataType : 'text'
        url: "http://14ef3e60.ngrok.io/q/close_pronounce/#{pronounce}"
        success:(data,status)->
          text = Lib.strip(data.responseText)
          # console.log('Data.getPronounce',status ,text )
          optionList = _getOptionProcess(text,word) ;
          callback(optionList) if typeof(callback) is 'function'
        error : ()->
          console.warn("getOptionList , ajax error ",e)


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
          console.warn "getMp3 , ajax error",error
        success: (data,status) ->
          # console.log("Data.getMp3",status)
          url = _getMp3Process(data)
          # console.log("Data.getMp3", 'url' , url)
          callback(url)

    _getMp3Process = (data)->
      str = data.responseText
      pos_head = str.search('http:')
      pos_tail = str.search('}')
      url = str.slice(pos_head, pos_tail - 1)
      url = url.replace(/\\/g, '')

      return url


  class _Page
    THIS = undefined
    Main = undefined
    $loseModal = $("#loseModal")
    $winModal = $('#winModal')

    $(document).on 'click','#loseModal .restart' , ()->
      $loseModal.modal('hide')
      Main.newGame()

    constructor :(_Main)->
      THIS = @
      Main = _Main

      $loseModal.show = (howStr,score)->
        $loseModal.find('.how').text(howStr)
        $loseModal.find('.score').text(score)

        $loseModal.modal(
          'backdrop' : 'static'
          'keyboard' : false
        )

    $winModal : $winModal
    $loseModal : $loseModal



  class GameController
    THIS = undefined

    Data = undefined

    Question = undefined
    Board = undefined
    Audio = undefined
    Timer = undefined

    Life = undefined
    Score = undefined

    Page = undefined

    _funcStatus = {}

    questionDataList = []

    ## view

    _initFuncStatus = ()->
      $('.funcBtn').removeClass('used')
      _funcStatus =
        half : true
        soundText : true
        skip : true

    _initSubControllers = (_this)->
      Data = new _Data(_this)
      Question = new _Question(_this)
      Board = new _Board(_this)
      Audio = new _Audio(_this)
      Timer = new _Time(_this)
      Life = new _Life(_this,1)
      Score = new _Score(_this)
      Page = new _Page(_this)



    prepareQuesiton : (wellPreparedCallback)->
      if questionDataList.length < 2
        Data.prepareQuestion (dataToShow)->
          questionDataList.push(dataToShow)
          THIS.prepareQuesiton(wellPreparedCallback)
      else if questionDataList.length >= 2
        # console.log("wellPreparedCallback",wellPreparedCallback)
        wellPreparedCallback() if wellPreparedCallback?
    constructor : ()->
      THIS = @
      _initSubControllers(THIS)
      THIS.prepareQuesiton ()->
        THIS.nextQuestion()
      _initFuncStatus()

    nextQuestion : ()->
      THIS.prepareQuesiton()
      Timer.start()
      data = questionDataList.shift()
      Board.refreshBoard(data.answerWord , data.optionList) ## Board to next round

      Audio.refreshSrc(data.audioUrl)
      Question.refresQuestion data.question, data.qIndex , ()->
        Audio.play()

    playSound : ()->
      console.log(Audio)
      if Audio.checkSrc()
        Audio.play()
        return true 
      else
        return false



    hint :(func)-> # the three treat function
      able = _funcStatus[func]
      console.log _funcStatus, able , func
      if able

        _funcStatus[func] = false

        switch func
          when 'half'
            Board.half()
          # when 'soundText'
          when 'skip'
            Main.nextQuestion()
          else
            console.warn('沒有處理的提示功能',func)
      return able


    minusLife : (amount = 1)->
      Life.minus(amount)

    newGame : ()->
      THIS.nextQuestion()
      _initFuncStatus()
      Life.setLife(5)
      Score.reset()

    addScore : (amount)->
      Score.addScore(amount)

    checkAnswer:(index)->
      Board.checkAnswer(index)

    lose : (how)->
      howStr = undefined
      Timer.stop()
      switch how
        when 'die' then howStr = "你失去所有生命值.."
        when 'timeout' then howStr = "你沒有在時間內完成答題.."

      Page.$loseModal.show(howStr,Score.getScore())

  Lib = new _Lib()
  Main = new GameController()
  $document = $(document) ;
  $document.on 'click','.ballon',()->
    $t = $(@)
    return false if $t.hasClass('broke')
    $t.addClass('broke')
    if $t.data('hasword') is true
      if Main.checkAnswer($t.data('index'))
        alert('答對了')
        Main.addScore()
        Main.nextQuestion()
      else
        alert('答錯了')
        Main.minusLife()
  $document.on 'click','.funcBtn',()->
    if Main.hint($(@).data('func'))
      $(@).addClass('used')
    else
      alert '這功能你已經用過了喔'

  $document.on 'click','.soundClickSpan', ->
    alert('後端抓不到發音的音訊') if not Main.playSound()
