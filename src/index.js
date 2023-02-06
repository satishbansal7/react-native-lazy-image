import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image as Img,
  Platform,
  ImageBackground,
} from 'react-native';
const NoImage = require('./noimage.png');

export const LazyImage = props => {
  const Image = props?.background ? ImageBackground : Img;
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [curentImageSource, setCurentImageSource] = useState(
    props?.source || '',
  );
  const [imageDetail, setImageDetail] = useState(null);
  const [isErrorCount, setIsErrorCount] = useState(0);
  const imagRef = useRef(null);

  const refVar = props?.background ? 'imageRef' : 'ref';
  const obj = {[refVar]: imagRef};

  const onError = e => {
    setLoading(false);
    setIsError(true);
  };
  const onLoadSuccessfully = e => {
    if (isError) {
      return;
    }
    setIsError(false);
  };
  const onLoadStart = e => {
    if (isError) {
      return;
    }
    setIsError(false);
    setLoading(true);
  };
  const onLoadEnd = e => {
    setLoading(false);
  };

  useEffect(() => {
    if (isError && isErrorCount < 2) {
      setIsErrorCount(prev => prev + 1);
      if (imagRef.current) {
        const nativeProp = Platform.OS === 'ios' ? 'source' : 'src';
        imagRef.current?.setNativeProps({
          [nativeProp]: [
            Img.resolveAssetSource(props?.default || NoImage),
          ],
        });
        setCurentImageSource(props?.default || NoImage);
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isErrorCount > 1) {
      // force show default image
      if (imagRef.current) {
        const nativeProp = Platform.OS === 'ios' ? 'source' : 'src';
        imagRef.current?.setNativeProps({
          [nativeProp]: [Img.resolveAssetSource(NoImage)],
        });
        setCurentImageSource(NoImage);
      }
    }
  }, [isErrorCount]);

  useEffect(() => {
    setCurentImageSource(props?.source);
  }, [props?.source]);

  useEffect(() => {
    if (curentImageSource?.uri) {
      Img.getSize(
        curentImageSource?.uri,
        (width, height) => {
          setImageDetail(prev => ({
            ...prev,
            width,
            height,
          }));
        },
        error => {
          setLoading(false);
          setIsError(true);
        },
      );
    } else {
      const imageDetail1 = Img.resolveAssetSource(curentImageSource);
      if (imageDetail1 && imageDetail1.width) {
        setImageDetail(prev => ({
          ...prev,
          width: imageDetail1.width,
          height: imageDetail1.height,
        }));
      }
    }
  }, [curentImageSource]);

  useEffect(() => {
    if (imageDetail) {
      props?.getSizeDetail ? props?.getSizeDetail(imageDetail) : '';
    }
  }, [imageDetail]);

  return (
    <>
      <Image
        {...obj}
        {...props}
        style={[
          (props.autoWidthHightApplied ?? true) && imageDetail?.width
            ? {width: imageDetail.width, height: imageDetail.height}
            : {},
          props.style,
          props?.imageStyle ?? {},
          props?.background ? {flex: 1} : {},
        ]}
        onError={onError}
        onLoad={onLoadSuccessfully}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        loadingIndicatorSource={
          props?.loading ?? true ? (
            <ActivityIndicator
              animating={true}
              size="large"
              color={props?.color}
            />
          ) : null
        }
      />
      {loading && (props?.loading ?? true) && (
        <View
          style={[
            (props.autoWidthHightApplied ?? true) && imageDetail?.width
              ? {width: imageDetail.width, height: imageDetail.height}
              : {},
            props.style,
            props?.imageStyle ?? {},
            styles.imageWrapper,
          ]}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={props?.color}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
