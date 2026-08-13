"use server"
import {PLANS} from '@/app/plan';

async function priceInfo(){
    if(PLANS) return PLANS;
}

export default priceInfo;