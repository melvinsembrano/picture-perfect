
var fbMe = {

  initSDK: function (appId, channelUrl) {
    var me = this;
    console.info('initializing FB SDK');

    window.fbAsyncInit = function() {
      FB.init({
        appId      : appId,                     // App ID
        channelUrl : channelUrl, // Channel File
        status     : true,                                    // check login status
        cookie     : true,                                    // enable cookies to allow the server to access the session
        xfbml      : true                                     // parse XFBML
      });

      // Listen to the auth.login which will be called when the user logs in
      // using the Login button
      FB.Event.subscribe('auth.login', function(response) {

      });

      FB.Event.subscribe('auth.statusChange', function(response) {
        myFaces.fbInit(response);
      });

      FB.Canvas.setAutoGrow();
    };

    me.loadSDK(document, 'script', 'facebook-jssdk');
  },

  loadSDK: function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
  }

};


var myFaces = {

  PictureBox: function(url, index, pr) {
    var me = this;
    me.el = $('<div></div>');
    me.el.html(
      $('<img />').attr('src', url).load(function() {
        pr.append(me.el);

        setTimeout(function() {
          me.el.show();
          var anim = myFaces.randomAnimation();
          me.el.addClass('animated ' + anim).attr('data-animation', anim);
          /**
          setTimeout(function() {
            me.el.addClass('rotateOutDownLeft');
            setTimeout(function(){
              me.el.hide(500);
            }, 1000);
          }, 5000 * myFaces.randomize(3));
          **/
        }, 0);

      })
    );
    me.el.css('float', 'left');
    me.el.addClass('picture');

    me.el.hide();
    return me.el;
  },

  randomOutAnimation: function() {
    var animations = [
      'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight',
      'bounceOut', 'bounceOutDown', 'bounceOutUp', 'bounceOutLeft', 'bounceOutRight'
    ];
    return animations[this.randomize(animations.length)-1];
  },

  randomAnimation: function() {
    var animations = [
      'rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight',
      'bounceIn', 'bounceInDown', 'bounceInUp', 'bounceInLeft', 'bounceInRight',
      'fadeIn', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeInUpBig', 'fadeInDownBig', 'fadeInLeftBig', 'fadeInRightBig'
    ];
    return animations[this.randomize(animations.length)-1];
  },


  randomize: function(i) {
    i = i || 5;
    return Math.floor((Math.random() * i) + 1);
  },

  fbInit: function (resp) {
    var me = this;
    console.info(resp);
    if(resp.status === "connected") {
      $("#auth-loggedout").show();
      $("#auth-loggedin").hide();

      me.process('/me/photos?limit=10');

      // me.processQuery();

    } else {
      $("#auth-loggedout").hide();
      $("#auth-loggedin").show();
    }
  },

  process: function (query) {
    console.info('processing...');

    var me = this;

    FB.api(query, function(response){ 
      me.resp = response;
      me.processData(response.data);
    });
  },

  processQuery: function() {
    var me = this;

    FB.api({
      method: 'fql.query',
      //query: "SELECT pid, src_big, src_small, src, link, caption, images FROM photo WHERE pid in (SELECT pid FROM photo_tag WHERE subject IN  (SELECT uid FROM family WHERE profile_id = me())) LIMIT 30"
      query: "SELECT pid, src_big, src_small, src, link, caption, images FROM photo WHERE pid in (SELECT pid FROM photo_tag WHERE subject IN  (SELECT uid2 FROM friend WHERE uid1 = me())) LIMIT 30"
    }, function(resp) {
      me.resp = resp;
      me.processData(resp);
 
    });

/**
    FB.api({
      method: 'fql.multiquery',
      queries: {
        'q1': 'SELECT uid FROM family WHERE profile_id = me()',
        'q2': 'SELECT pid FROM photo_tag WHERE subject IN (SELECT uid FROM #q1)',
        'q3': 'SELECT pid, src_big, src_small, src, link, caption, images FROM photo WHERE pid in (SELECT pid FROM #q2)'
      }
    }, function(resp) {
      console.info(resp);
    });
**/

  },

  processData: function(data) {
    var me = this, el;
    el = $('#images_panel');
    el.find('.picture').each(function() {
      $(this).removeClass($(this).data().animation);
      $(this).addClass(me.randomOutAnimation());
    });

    setTimeout(function() {
      el.html('');

      $.each(data, function(i) {
        //console.info(this);
        new myFaces.PictureBox(this.images[me.randomize(4)+4].source, i, el);
      });

    }, 2000);

  },

  next: function() {
    if (this.resp) {
      this.process(this.resp.paging.next);
    }
  },

  previous: function() {
    if (this.resp) {
      this.process(this.resp.paging.previous);
    }
  },

  init: function () {
    var me = this;
    me.attachEvents();
  },

  attachEvents: function() {
    var me = this;

    $("#auth-loginlink").click(function() {
      FB.login(function() {
        // callback function
      },{scope: 'user_about_me,user_photos,friends_photos,user_relationships'});
    });

    $("#auth-logoutlink").click(function() {
      FB.logout();
    });

    $('#next_page').click(function() {
      me.next();
    });

    $('#prev_page').click(function() {
      me.previous();
    });


  }
};

$(document).ready(function () {
  myFaces.init();
});

