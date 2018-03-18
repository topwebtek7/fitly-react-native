/**
 * @flow
 */

import React, { Component } from 'react';
import {
  StatusBar,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Modal,
  Slider,
  InteractionManager,
  Platform
} from 'react-native';
import { loginStyles, loadingStyle, commonStyle } from '../styles/styles.js';
import FBloginBtn from '../common/FBloginBtn.js';
import {
  setFirebaseUID,
  setSignUpMethod,
  printAuthError,
  clearAuthError
} from '../actions/auth.js';
import { setLoadingState } from '../actions/app.js';
import { resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Firebase from 'firebase';
import Btn from '../common/Btn';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getCurrentPlace,
  getPlaceByName
} from '../library/asyncGeolocation.js';

import { NavigationActions } from 'react-navigation';
const isAndroid = Platform.OS === 'android';

class SignUpView extends Component {
  constructor(props) {
    super(props);
    //refactor to redux later, must validate input
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agreement: false,
      location: null
    };
  }

  componentWillMount() {
    this.props.action.clearAuthError();
    this._getLocation();
    // InteractionManager.runAfterInteractions(()=>{
    //   this._getLocation();
    // });
  }

  _getLocation = async () => {
    try {
      //let currentLocation;
      if (!this.state.location) {
        let location = await getCurrentPlace();
        //let coord = {
        //  lat: location.position.lat,
        //  lon: location.position.lng,
        //}
        //currentLocation = {
        //  place: `${location.subAdminArea}, ${location.adminArea}`,
        //  coordinate: coord,
        //  zip: location.postalCode,
        //}
        if (!location) {
          location = {
            place: 'San Francisco, CA',
            zip: '94108',
            coordinate: {
              lat: 37.7858515,
              lon: -122.4065285
            }
          };
        }
        this.setState({ location: location });
      }
    } catch (error) {
      console.log(error);
    }
  };

  _handleEmailSignup() {
    //TODO error reporting for login error
    //TODO validate the email, password and names before sending it out
    const { navigation, action } = this.props;
    const { FitlyFirebase } = navigation.state.params;

    (async () => {
      try {
        //const location = await getCurrentPlace();
        //if(!location){
        //  this.setState({
        //    location: {
        //      place: "San Francisco, CA",
        //      zip: "94108",
        //      coordinate: {
        //        lat: 37.7858515,
        //        lon: -122.4065285,
        //      }
        //    }
        //  })
        //}
        // action.setLoadingState(true);
        action.clearAuthError();
        await FitlyFirebase.auth().signOut();
        const authData = await FitlyFirebase.auth().createUserWithEmailAndPassword(
          this.state.email,
          this.state.password
        );
        await authData.updateProfile({
          displayName: this.state.firstName + ' ' + this.state.lastName
        });
        action.setSignUpMethod('Email');
        action.setFirebaseUID(authData.uid);

        //TODO: send verification email
        authData.sendEmailVerification();

        const userRef = FitlyFirebase.database().ref('users/' + authData.uid);
        const serverVal = await Firebase.database.ServerValue;

        //TODO: set up a real location for the default user image
        userRef.set({
          public: {
            account: 'default',
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            provider: 'Firebase',
            followerCount: 0,
            followingCount: 0,
            sessionCount: 0,
            profileComplete: false,
            dateJoined: serverVal.TIMESTAMP,
            picture:
              'https://firebasestorage.googleapis.com/v0/b/brawlmoney.appspot.com/o/default%2Fdefault-user-image.png?alt=media&token=28b12112-9d7c-4bf3-b7f8-345927c120e7',
            userCurrentLocation: this.state.location,
            userLocation: this.state.location
          },
          private: {
            email: this.state.email,
            height: 0,
            weight: 0,
            activeLevel: 5
          }
        });
        const verifyEmailActions = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'VerifyEmailView',
              params: {
                authData,
                email: this.state.email,
                password: this.state.password
              }
            })
          ]
        });
        // navigation.navigate("VerifyEmailView", {authData: authData, email: this.state.email, password: this.state.password});
        navigation.dispatch(verifyEmailActions);
        action.setLoadingState(false);
      } catch (error) {
        action.setLoadingState(false);
        action.printAuthError(error.message);
      }
    })();
  }

  focusNextField = nextField => {
    this.props.action.clearAuthError();
    this.refs[nextField].focus();
  };

  _terms() {
    return (
      <Text>
        The Fitly App End User License Agreement{'\n\n'}
        This End User License Agreement (“Agreement”) is between you and The
        Fitly App and governs use of this app made available through the Apple
        App Store. By installing The Fitly App, you agree to be bound by this
        Agreement and understand that there is no tolerance for objectionable
        content. If you do not agree with the terms and conditions of this
        Agreement, you are not entitled to use The Fitly App.{'\n\n'}
        In order to ensure The Fitly App provides the best experience possible
        for everyone, we strongly enforce a no tolerance policy for
        objectionable content. If you see inappropriate content, please use the
        “Report” feature found under each post or event.{'\n\n'}
        1. Parties{'\n'}
        This Agreement is between you and The Fitly App only, and not Apple,
        Inc. (“Apple”). Notwithstanding the foregoing, you acknowledge that
        Apple and its subsidiaries are third party beneficiaries of this
        Agreement and Apple has the right to enforce this Agreement against you.
        The Fitly App, not Apple, is solely responsible for The Fitly App and
        its content.{'\n\n'}
        2. Privacy{'\n'}
        The Fitly App may collect and use information about your usage of The
        Fitly App, including certain types of information from and about your
        device. The Fitly App may use this information, as long as it is in a
        form that does not personally identify you, to measure the use and
        performance of The Fitly App.{'\n\n'}
        3. Limited License{'\n'}
        The Fitly App grants you a limited, non-exclusive, non-transferable,
        revocable license to use The Fitly App for your personal, non-commercial
        purposes. You may only use The Fitly App on Apple devices that you own
        or control and as permitted by the App Store Terms of Service.{'\n\n'}
        4. Age Restrictions{'\n'}
        By using The Fitly App, you represent and warrant that (a) you are 17
        years of age or older and you agree to be bound by this Agreement; (b)
        if you are under 17 years of age, you have obtained verifiable consent
        from a parent or legal guardian; and (c) your use of The Fitly App does
        not violate any applicable law or regulation. Your access to The Fitly
        App may be terminated without warning if The Fitly App believes, in its
        sole discretion, that you are under the age of 17 years and have not
        obtained verifiable consent from a parent or legal guardian. If you are
        a parent or legal guardian and you provide your consent to your child’s
        use of The Fitly App, you agree to be bound by this Agreement in respect
        to your child’s use of The Fitly App.{'\n\n'}
        5. Objectionable Content Policy{'\n'}
        Content may not be submitted to The Fitly App, who will moderate all
        content and ultimately decide whether or not to post a submission to the
        extent such content includes, is in conjunction with, or alongside any,
        Objectionable Content. Objectionable Content includes, but is not
        limited to: (i) sexually explicit materials; (ii) obscene, defamatory,
        libelous, slanderous, violent and/or unlawful content or profanity;
        (iii) content that infringes upon the rights of any third party,
        including copyright, trademark, privacy, publicity or other personal or
        proprietary right, or that is deceptive or fraudulent; (iv) content that
        promotes the use or sale of illegal or regulated substances, tobacco
        products, ammunition and/or firearms; and (v) gambling, including
        without limitation, any online casino, sports books, bingo or poker.{
          '\n\n'
        }
        6. Warranty{'\n'}
        The Fitly App disclaims all warranties about The Fitly App to the
        fullest extent permitted by law. To the extent any warranty exists under
        law that cannot be disclaimed, The Fitly App, not Apple, shall be solely
        responsible for such warranty.{'\n\n'}
        7. Maintenance and Support{'\n'}
        The Fitly App does provide minimal maintenance or support for it but not
        to the extent that any maintenance or support is required by applicable
        law, The Fitly App, not Apple, shall be obligated to furnish any such
        maintenance or support.{'\n\n'}
        8. Product Claims{'\n'}
        The Fitly App, not Apple, is responsible for addressing any claims by
        you relating to The Fitly App or use of it, including, but not limited
        to: (i) any product liability claim; (ii) any claim that The Fitly App
        fails to conform to any applicable legal or regulatory requirement; and
        (iii) any claim arising under consumer protection or similar
        legislation. Nothing in this Agreement shall be deemed an admission that
        you may have such claims.{'\n\n'}
        9. Third Party Intellectual Property Claims{'\n'}
        The Fitly App shall not be obligated to indemnify or defend you with
        respect to any third party claim arising out or relating to The Fitly
        App. To the extent The Fitly App is required to provide indemnification
        by applicable law, The Fitly App, not Apple, shall be solely responsible
        for the investigation, defense, settlement and discharge of any claim
        that The Fitly App or your use of it infringes any third party
        intellectual property right.
      </Text>
    );
  }

  _privacy() {
    return (
      <Text>
        Protecting your privacy is a serious matter and doing so is very
        important to us. Please read this Privacy Policy statement (the
        "Policy") to learn more about our Privacy Policy. This Policy describes
        the information The Fitly App, Inc. (“The Fitly App”, “our”, “we”)
        collect from you and what may happen to that information, and only
        applies to such information. This Policy applies to all sites under the
        thefitlyapp.com domain as well as our platforms, tools, and services
        (together, the "Platform").{'\n\n'}
        1. Information Collection{'\n'}
        • 1.1. We collect the following information about you and your use of
        our Platform in order to create a better, more personalized experience
        for you:{'\n'}
        o 1.1.1. a nickname selected by you or assigned by us, your email
        address, your name (if provided) a password selected by you, your zip
        code; and{'\n'}
        o 1.1.2. for each The Fitly App Group or The Fitly App Event in which
        you participate, you may choose to create and store a short description
        or statement which will be viewed by anyone who is accessing that The
        Fitly App Group or The Fitly App Everywhere, and your message board
        postings.{'\n'}
        o 1.1.3. for purposes of this Policy, "Personally Identifiable
        Information" means information that could be used to identify your
        personally (such as your email address or IP address), which has not
        been previously or subsequently disclosed by you on the public areas of
        our website or in messages you send to your The Fitly App Group Mailing
        Lists or The Fitly App Everywhere emails.{'\n'}
        • 1.2. We automatically track certain basic information about our
        members (such as internet protocol (IP) addresses, browser type,
        internet service provider (ISP), referring/exit pages, click patterns,
        etc.). We use this information to do internal research on our members'
        usage patterns, demographics, interests and general behavior to better
        understand and serve you and our community.{'\n'}
        • 1.3. We currently contract with online partners to help manage and
        optimize our business and communications. For example, we use the
        services of partners to help us deliver and measure the effectiveness of
        our advertising and how visitors use our Platform. To do this, we and
        our partners use third-party tracking technologies such as web beacons,
        pixels and cookies on this Platform and on other websites and online
        services. A "cookie" is a piece of data stored on your computer that is
        tied to information about you. The type of information collected
        includes the URL you came from and go to, your browser information, and
        IP address, and helps us learn how to improve our service. We use these
        technologies for authentication, tracking user sessions, preferences,
        and movements around the Platform, anonymous and aggregated marketing
        analytics, performance analytics, ad retargeting, and tracking aggregate
        trends on the Platform. No information shared with our partners through
        cookies and related technologies is directly linked to your Personally
        Identifiable Information.{'\n'}
        • 1.4. For our members' convenience, we also use "cookies" to allow you
        to enter your password less frequently during a session and to provide
        for an easier registration process. If you configure your browser or
        otherwise choose to reject the cookies, you may still use our site.
        However, to best experience our website and Platform and most easily use
        our Platform you must have cookies enabled. Our use of cookies is
        consistent with the rights and restrictions set forth in Section 2.{
          '\n'
        }
        • 1.5. We may collect information such as postings you make on the
        public areas of our website, messages you send to the The Fitly App
        Group Mailing List or The Fitly App Everywhere emails, messages you send
        to us, and correspondence we receive from other members or third parties
        about your activities or postings on our website. Our use of this
        information is consistent with the rights and restrictions set forth in
        Section 2.{'\n\n'}
        2. Use of Information{'\n'}
        • 2.1. We use the information we collect about you (including your
        Personally Identifiable Information) to create a better, more
        personalized experience for you based on your individual usage habits,
        improve our marketing and promotional efforts, analyze site usage,
        improve our content and product offerings, and customize our site's
        content, layout and Services. These uses improve our site and allow us
        to better customize it to meet your needs. We also use the information
        we collect about you to resolve disputes, troubleshoot problems, and
        enforce our Terms of Service Agreement.{'\n'}
        • 2.2. We may compile the information we collect about you and use
        it, in an aggregate form only, in the negotiation and establishment of
        service agreements with public and/or private enterprises under which
        such enterprises will serve as The Fitly App partners or as venues for
        meetings between our members ("The Fitly Apps").{'\n'}
        • 2.3. We may use for promotional, sales or any use that we consider
        appropriate your correspondence with us or photographs submitted for
        publication on our website, be it via email, postings on our website, or
        feedback via the member polls. Our use of such materials is consistent
        with the restrictions on disclosure of Personally Identifiable
        Information set forth in Section 3.{'\n\n'}
        3. Disclosure of Your Information{'\n'}
        • 3.1. Opt-in requirement. WITHOUT YOUR AFFIRMATIVE CONSENT (ON A
        CASE-BY-CASE BASIS), WE DO NOT SELL, RENT OR OTHERWISE SHARE YOUR
        PERSONALLY IDENTIFIABLE INFORMATION WITH OTHER THIRD PARTIES, UNLESS
        OTHERWISE REQUIRED AS DESCRIBED BELOW UNDER "REQUIRED DISCLOSURES". TO
        THE EXTENT WE SHARE INFORMATION WITH OUR PARTNERS AND ADVERTISERS, WE
        SHARE ONLY AGGREGATED OR OTHERWISE NON-PERSONALLY IDENTIFIABLE
        INFORMATION THAT IS NOT LINKED TO YOUR PERSONALLY IDENTIFIABLE
        INFORMATION. Aggregated information that we may share with our marketing
        partners includes, but is not limited to, information showing the
        relative popularity of one The Fitly App venue over another, or the
        popularity of certain The Fitly App topics.{'\n'}
        • 3.2. You should understand that information you provide through the
        registration process or post to the public areas of our website, or
        through the use of our Platform (including your name (if provided) and
        location information) may be accessible by and made public through
        syndication programs and by search engines, metasearch tools, crawlers,
        metacrawlers and other similar programs.{'\n'}
        • 3.3. Required disclosures. Though we make every effort to preserve
        member privacy, we may need to disclose your Personally Identifiable
        Information when required by law or if we have a good-faith belief that
        such action is necessary to (a) comply with a current judicial
        proceeding, a court order or legal process served on our website, (b)
        enforce this Policy or the Terms of Service Agreement, (c) respond to
        claims that your Personal Information violates the rights of third
        parties; or (d) protect the rights, property or personal safety of The
        Fitly App, its members and the public. You authorize us to disclose any
        information about you to law enforcement or other government officials
        as we, in our sole discretion, believe necessary or appropriate, in
        connection with an investigation of fraud, intellectual property
        infringements, or other activity that is illegal or may expose us or you
        to legal liability.{'\n\n'}
        4. Communications from The Fitly App and Members of the The Fitly App
        Community{'\n'}
        • 4.1. Communication from The Fitly App and Members of the The Fitly App
        Community are governed by Sections 7.1 and 7.2 of our Terms of Service.
        You may manage your subscriptions to all The Fitly App Communications in
        the Communication Preferences tab of the Your Account page.{'\n'}
        4B. Retargeting{'\n'}
        • 4.2 We partner with third parties to manage our advertising on other
        sites and services. Our third party partners may use technologies such
        as cookies and other third-party tracking technologies to gather
        information about your activities on our Platform to market and
        advertise our services to you on third party sites and services. For
        example, third parties that we work with may use the fact that you
        visited our Platform to target ads for The Fitly App services to you on
        non-The Fitly App sites and services. Third parties that use cookies and
        other tracking technologies to deliver targeted advertisements on third
        party sites and services may offer you a way to prevent such targeted
        advertisements by opting-out at the websites of industry groups such as
        the Network Advertising Initiative
        (http://www.networkadvertising.org/choices/) and/or the Digital
        Advertising Alliance (http://www.aboutads.info/choices/) or if located
        in the European Union, the European Interactive Digital Advertising
        Alliance (http://www.youronlinechoices.eu/). You may also be able to
        control advertising cookies provided by publishers, for example Google's
        Ad Preference Manager (https://www.google.com/settings/ads/onweb/).
        Please note that even if you choose to opt-out of receiving targeted
        advertising, you may still receive advertising about our Platform — it
        just will not be tailored to your interests or activities.{'\n\n'}
        5. Reviewing, Updating, Deleting and Deactivating Personal Information{
          '\n'
        }
        • 5.1. After registration for our Platform and for specific topic
        groups, The Fitly App Groups or The Fitly App Everywheres, we provide a
        way to update your Personally Identifiable Information. Upon your
        request, we will deactivate your account and remove your Personally
        Identifiable Information from our active databases. To make this
        request, email privacy@thefitlyapp.com. Upon our receipt of your
        request, we will deactivate your account and remove your Personally
        Identifiable Information as soon as reasonably possible in accordance
        with our deactivation policy and applicable law. Nonetheless, we will
        retain in our files information you may have requested us to remove if,
        in our discretion, retention of the information is necessary to resolve
        disputes, troubleshoot problems or to enforce the Terms of Service
        Agreement. Furthermore, your information is never completely removed
        from our databases due to technical and legal constraints (for example,
        we will not remove your information from our back up storage).{'\n\n'}
        6. Notification of Changes{'\n'}
        • 6.1. If we decide to change this Policy, we will post those changes on
        http://www.thefitlyapp.com/privacy or post a notice of the changes to
        this Policy on the homepage (https://www.thefitlyapp.com/) and other
        places we deem appropriate, so you are always aware of what information
        we collect, how we use it, and under what circumstances, if any, we
        disclose it. We will use information in accordance with the Privacy
        Policy statement under which the information was collected.{'\n'}
        • 6.2. If we make any material changes in our privacy practices, we will
        post a prominent notice on our website notifying you and our other
        members of the change. In some cases where we post a notice we will also
        email you and other members who have opted to receive communications
        from us, notifying them of the changes in our privacy practices.
        However, if you have deleted/deactivated your account, then you will not
        be contacted, nor will your previously collected personal information be
        used in this new manner.{'\n'}
        • 6.3. If the change to this Policy would change how your Personally
        Identifiable Information is treated, then the change will not apply to
        you without your affirmative consent. However, if after a period of
        thirty (30) days you have not consented to the change in the Policy,
        your account will be automatically suspended until such time as you may
        choose to consent to the Policy change. Until such consent, your
        personal information will be treated under the Policy terms in force
        when you began your membership.{'\n'}
        • 6.4. Any other change to this Policy (i.e., if it does not change how
        we treat your Personally Identifiable Information) will become are
        effective after we provide you with at least thirty (30) days notice of
        the changes and provide notice of the changes as described above. You
        must notify us within this 30 day period if you do not agree to the
        changes to the Policy and wish to deactivate your account as provided
        under Section 5.{'\n\n'}
        7. Dispute Resolution{'\n'}
        • 7.1. Any dispute, claim or controversy arising out of or relating to
        this Policy or previous Privacy Policy statements shall be resolved
        through negotiation, mediation and arbitration as provided under our
        Terms of Service Agreement.
      </Text>
    );
  }

  _renderAgreement(view) {
    return (
      <View style={{ flex: 1, margin: 20, marginTop: 80, marginBottom: 80 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 5,
            shadowColor: 'black',
            shadowOpacity: 0.6,
            elevation: 2,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 2,
            marginBottom: 20
          }}
        >
          <ScrollView>
            {view === 'privacy' ? this._privacy() : this._terms()}
          </ScrollView>
        </View>
        <Btn
          style={{ backgroundColor: 'white', alignSelf: 'center' }}
          textStyle={{ color: '#1D2F7B' }}
          text={'Done'}
          onPress={() => this.setState({ agreement: false })}
        />
      </View>
    );
  }

  render() {
    const { FitlyFirebase } = this.props.navigation.state.params;
    //console.log("PROPSIKI", FitlyFirebase)

    if (this.props.loading === true) {
      return (
        <View style={loadingStyle.app}>
          <StatusBar barStyle="default" />
          <ActivityIndicator
            animating={this.state.loading}
            style={{ height: 80 }}
            size="large"
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: '#1D2F7B' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 30, left: 10, zIndex: 99 }}
            onPress={() => this.props.navigation.goBack()}
          >
            <Icon name="ios-arrow-back-outline" size={40} color="#fff" />
          </TouchableOpacity>
          {this.state.agreement ? (
            <Modal
              animationType={'fade'}
              transparent={true}
              visible={!!this.state.agreement}
              onRequestClose={() =>
                this.setState({
                  agreement: false
                })
              }
            >
              {this._renderAgreement(this.state.agreement)}
            </Modal>
          ) : (
            <View>
              <ScrollView
                keyboardDismissMode={isAndroid ? 'none' : 'on-drag'}
                contentContainerStyle={loginStyles.container}
              >
                <KeyboardAvoidingView
                  behavior="position"
                  style={loginStyles.KeyboardAvoidingContainer}
                >
                  <StatusBar barStyle="light-content" />

                  <Text style={loginStyles.logo}>Fitly</Text>
                  {
                    // <Text style={[loginStyles.header, {paddingTop: 0}]}>
                    //   JOIN US
                    // </Text>
                  }

                  {this.state.emailSignUp ? (
                    <View>
                      <View style={loginStyles.form}>
                        <TextInput
                          underlineColorAndroid={'transparent'}
                          returnKeyType="next"
                          maxLength={30}
                          clearButtonMode="always"
                          ref="1"
                          onSubmitEditing={() => this.focusNextField('2')}
                          style={loginStyles.input}
                          onChangeText={text =>
                            this.setState({ firstName: text })
                          }
                          value={this.state.firstName}
                          placeholder="First Name"
                          autoCorrect={false}
                          placeholderTextColor="white"
                        />
                      </View>
                      <View style={loginStyles.form}>
                        <TextInput
                          underlineColorAndroid={'transparent'}
                          returnKeyType="next"
                          maxLength={30}
                          clearButtonMode="always"
                          ref="2"
                          onSubmitEditing={() => this.focusNextField('3')}
                          style={loginStyles.input}
                          onChangeText={text =>
                            this.setState({ lastName: text })
                          }
                          value={this.state.lastName}
                          autoCorrect={false}
                          placeholder="Last Name"
                          placeholderTextColor="white"
                        />
                      </View>
                      <View style={loginStyles.form}>
                        <TextInput
                          underlineColorAndroid={'transparent'}
                          returnKeyType="next"
                          maxLength={128}
                          clearButtonMode="always"
                          ref="3"
                          onSubmitEditing={() => this.focusNextField('4')}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={loginStyles.input}
                          onChangeText={text => this.setState({ email: text })}
                          value={this.state.email}
                          placeholder="Email"
                          placeholderTextColor="white"
                        />
                      </View>
                      <View style={loginStyles.form}>
                        <TextInput
                          underlineColorAndroid={'transparent'}
                          returnKeyType="next"
                          maxLength={128}
                          clearButtonMode="always"
                          secureTextEntry={true}
                          ref="4"
                          onSubmitEditing={() => this.focusNextField('5')}
                          style={loginStyles.input}
                          onChangeText={text =>
                            this.setState({ password: text })
                          }
                          value={this.state.password}
                          placeholder="Choose Password"
                          placeholderTextColor="white"
                        />
                      </View>
                      <View style={[loginStyles.form, { marginBottom: 0 }]}>
                        {/* make sure the confirm password is the same */}
                        <TextInput
                          underlineColorAndroid={'transparent'}
                          returnKeyType="join"
                          maxLength={128}
                          clearButtonMode="always"
                          secureTextEntry={true}
                          ref="5"
                          onSubmitEditing={() => this._handleEmailSignup()}
                          style={loginStyles.input}
                          onChangeText={text =>
                            this.setState({ passwordConfirm: text })
                          }
                          value={this.state.passwordConfirm}
                          placeholder="Confirm Password"
                          placeholderTextColor="white"
                        />
                      </View>
                      {this.props.error ? (
                        <Text style={commonStyle.error}>
                          {' '}
                          {this.props.error}{' '}
                        </Text>
                      ) : (
                        <Text style={commonStyle.hidden}> </Text>
                      )}
                    </View>
                  ) : (
                    <View>
                      <FBloginBtn
                        navigation={this.props.navigation}
                        FitlyFirebase={FitlyFirebase}
                        label="Continue with Facebook"
                        handleError={error => this.setState({ error: error })}
                      />
                      {this.props.error ? (
                        <Text style={commonStyle.error}>
                          {' '}
                          {this.props.error}{' '}
                        </Text>
                      ) : (
                        <Text style={commonStyle.hidden}> </Text>
                      )}
                      <Text style={loginStyles.textSmall}>or</Text>

                      <TouchableHighlight
                        style={loginStyles.FBbtn}
                        onPress={() => {
                          this.setState({ emailSignUp: true }, () =>
                            this.focusNextField('1')
                          );
                        }}
                      >
                        <Text style={loginStyles.btnText}>
                          Continue with Email
                        </Text>
                      </TouchableHighlight>
                    </View>
                  )}
                </KeyboardAvoidingView>
                <View style={{ marginTop: 40 }}>
                  <Text style={loginStyles.disclamerText}>
                    By signing up, you agree to Fitly's
                  </Text>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}
                  >
                    <TouchableOpacity
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#fff',
                        flexDirection: 'column',
                        alignSelf: 'center',
                        alignItems: 'center',
                        width: 45,
                        height: 20
                      }}
                      onPress={() => {
                        this.setState({ agreement: 'term' });
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          backgroundColor: 'transparent',
                          paddingBottom: 5
                        }}
                      >
                        Terms
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'white' }}> & </Text>
                    <TouchableOpacity
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#fff',
                        flexDirection: 'column',
                        alignSelf: 'center',
                        alignItems: 'center',
                        width: 100,
                        height: 20
                      }}
                      onPress={() => {
                        this.setState({ agreement: 'privacy' });
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          backgroundColor: 'transparent'
                        }}
                      >
                        Privacy Policy.
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{ height: 100 }} />
              </ScrollView>
              {/* TODO: use SwipeableListView? */}
            </View>
          )}
          {this.state.emailSignUp ? (
            <TouchableHighlight
              style={[
                loginStyles.swipeBtn,
                { position: 'absolute', zIndex: 99, bottom: 0, left: 0 }
              ]}
              onPress={() => this._handleEmailSignup()}
            >
              <Text style={loginStyles.btnText}>JOIN</Text>
            </TouchableHighlight>
          ) : null}
        </View>
      );
    }
  }
}

const mapStateToProps = function(state) {
  return {
    loading: state.app.loading,
    error: state.auth.errorMsg
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators(
      {
        setFirebaseUID,
        setSignUpMethod,
        printAuthError,
        clearAuthError,
        setLoadingState
      },
      dispatch
    ),
    exnavigation: bindActionCreators({ resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpView);
