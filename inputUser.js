import {text} from '@clack/prompts';


export async function inputUser(){
    const perguntaUser = await text({
        message: 'Pergunte algo para a IA',
        validate(value){
            if (value.length === 0) return 'valor não inserido'
        },
    })
    
    return perguntaUser;
}