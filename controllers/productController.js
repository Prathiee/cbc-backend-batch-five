import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function getProduct(req,res){
//    Product.find().then(
//       (data)=>{
//            res.json(data)
//        }
//    ).catch(
//        (err)=>{
//            res.json({
//                message: "Failed to getProducts",
//                error: err
 //           })
//        }
//    )
      try{
        if(isAdmin(req)){
            const products=await Product.find()
            res.json(products)
        }else{
            const products=await Product.find({isAvailable : true})
            res.json(products)
        }
      }catch(err){
        res.json({
            message: "Failed to get Products",
            error: err
        })
      }
}

export function saveProduct(req, res){
    
    if(!isAdmin(req)){
        res.status(403).json({
            message : "You are not authorized to add a product"
        })
        return
    }
       

        const product = new Product(
            req.body
        );

        product.save().then(()=>{
            res.json({
                message : "Product Added Successfully"
            });
        }).catch(()=>{
            res.json({
                message : "Failed to add Product"
            });
        });
    }

    export async function deleteProduct(req,res){
        if(isAdmin(req)){
            res.status(403).json({
                message: "You are not authorized to delete a product"
            })
            return
        }
        try{
           await Product.deleteOne({productId : req.params.productId})

        res.json({
            message : "Product deleted successfully"
        }) 
        }catch(err){
            res.status(500).json({
                message : "Failed to delete Product",
                error : err
            })
        }
        
    }

    export async function updateProduct(req,res){
        if(!isAdmin(req)){
            res.status(403).json({
                message: "You are not authorized to update a product"
            })
            return
        }
        const productId = req.params.productId
        const updatingData = req.body

        try{
            await Product.updateOne(
                {productId : productId},
                updatingData
            )
            res.json(
                {
                    message : "Product Updated Successfully"
                }
            )
        }catch(err){
            res.status(500).json({
                message : "Internal Server Error",
                error : err
            })
        }
    }

    export async function getProductById(req,res){
          const productId = req.params.productId
          
          try{
            const product = await Product.findOne(
                {productId : productId}
            )
            if(product == null){
                res.status(404).json({
                    message : "Product not found"
                })
                return
            }
            if(product.isAvailable){
                res.json(product)
            }else{
                if(!isAdmin(req)){
                    res.status(404).json({
                        message : "Product not found"
                    })
                    return
                }else{
                    res.json(product)
                }
            }

          }catch(err){
              res.status(500).json({
                message : "Internal server error",
                error : err
              })
          }
    }
