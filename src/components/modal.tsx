import { Modal, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-rapi-ui";

import { t } from "../services/i18n";
import { verticalScale } from "../util/ui-metrics";


export function ConfirmModal({children, options, visible, footer} : {children:any, visible:boolean, options?:any, footer?:any}) {

    return (
        <Modal visible={visible} transparent={true} animationType="slide" >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>{ options?.title || '' }</Text>
                    <View style={{width: '100%'}}>
                        {children}
                    </View>
                    <View style={{width: '100%'}} >
                        {footer}
                    </View>
                </View>
            </View>
        </Modal>
    );

}


export function DeleteConfirmModal({children, options, visible, onConfirm, onCancel} : {visible:boolean, onCancel: () => void, onConfirm: () => void, children?:any, options?:any, }) {

    const footer = (
        <>
            <Button text={t('buttons:cancel')} onPress={() => { onCancel ? onCancel() : null; }} style={styles.button} />
            <Button text={t('buttons:delete')} onPress={() => { onConfirm ? onConfirm() : null; }} style={{...styles.button, backgroundColor: 'red'}} status="danger" />
        </>
    );

    return (
        <ConfirmModal options={options} visible={visible} footer={footer}>
            {children}
        </ConfirmModal>
    );

}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        // backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.5)'
    },
    modalView: {
        // margin: 20,
        marginTop: verticalScale(800),
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        width: '100%',
        height: '100%',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        // backgroundColor: 'red'
    },
    title: {
        marginBottom: 15,
        fontSize: 22,
        textAlign: 'center',
    },
    button: {
        margin: 10,
        width: '100%'
    }
});
