import React from 'react';
import { useAppFlow } from './useAppFlow';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { CommunityScreen } from '../features/community/CommunityScreen';
import { AiChatScreen } from '../features/ai-chat/AiChatScreen';
import { QuoteMethodScreen } from '../features/quote/screens/QuoteMethodScreen';
import { CameraCaptureScreen } from '../features/quote/screens/CameraCaptureScreen';
import { GalleryPickerScreen } from '../features/quote/screens/GalleryPickerScreen';
import { OcrPreviewScreen } from '../features/quote/screens/OcrPreviewScreen';
import { QuoteFormScreen } from '../features/quote/screens/QuoteFormScreen';

export default function AppRoot() {
  const { state, actions } = useAppFlow();

  if (state.screen === 'home') {
    return (
      <HomeScreen
        nickname={state.nickname}
        tab={state.homeTab}
        onChangeTab={actions.setHomeTab}
        onPressRegister={() => actions.setScreen('quote-method')}
        onPressCommunity={() => actions.setScreen('community')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
      />
    );
  }

  if (state.screen === 'ai-chat') {
    return (
      <AiChatScreen
        nickname={state.nickname}
        onPressHome={() => actions.setScreen('home')}
        onPressCommunity={() => actions.setScreen('community')}
      />
    );
  }

  if (state.screen === 'community') {
    return (
      <CommunityScreen
        nickname={state.nickname}
        onPressHome={() => actions.setScreen('home')}
        onPressAiChat={() => actions.setScreen('ai-chat')}
      />
    );
  }

  if (state.screen === 'quote-method') {
    return (
      <QuoteMethodScreen
        nickname={state.nickname}
        tab={state.homeTab}
        onChangeTab={actions.setHomeTab}
        onClose={() => actions.setScreen('home')}
        onSelect={(type) => {
          actions.setRegisterType(type);
          if (type === 'camera') actions.setScreen('camera-capture');
          if (type === 'gallery') actions.setScreen('gallery-picker');
          if (type === 'manual') actions.setScreen('quote-form');
        }}
      />
    );
  }

  if (state.screen === 'camera-capture') {
    return <CameraCaptureScreen onBack={() => actions.setScreen('quote-method')} onCapture={() => actions.setScreen('ocr-preview')} />;
  }

  if (state.screen === 'gallery-picker') {
    return <GalleryPickerScreen onBack={() => actions.setScreen('quote-method')} onPick={() => actions.setScreen('ocr-preview')} />;
  }

  if (state.screen === 'ocr-preview') {
    return (
      <OcrPreviewScreen
        onBack={() => actions.setScreen(state.registerType === 'camera' ? 'camera-capture' : 'gallery-picker')}
        onNext={() => actions.setScreen('quote-form')}
      />
    );
  }

  if (state.screen === 'quote-form') {
    return (
      <QuoteFormScreen
        onBack={() => actions.setScreen('home')}
        initialMethod={state.registerType}
        ocrFilled={state.registerType === 'camera' || state.registerType === 'gallery'}
      />
    );
  }

  return (
    <OnboardingScreen
      step={state.step}
      stepKey={state.stepKey}
      totalSteps={state.totalSteps}
      nickname={state.nickname}
      bookTitle={state.bookTitle}
      author={state.author}
      selectedRecordOption={state.selectedRecordOption}
      selectedMood={state.selectedMood}
      isNextDisabled={state.isNextDisabled}
      onNicknameChange={actions.setNickname}
      onBookTitleChange={actions.setBookTitle}
      onAuthorChange={actions.setAuthor}
      onRecordOptionChange={actions.setSelectedRecordOption}
      onMoodChange={actions.setSelectedMood}
      onPrev={actions.goPrev}
      onNext={actions.goNext}
    />
  );
}
